import type { Request, Response, NextFunction, Handler } from "express";
import { authGoogleReqIdRequiredError, authGoogleCallbackStateInvalidError, AppError, authGoogleCallbackReqExpiredError } from "../../error.js";
import { findActiveUserById, findOneAuthReq, updateAuthReqStatus } from "./repository.js";
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";
import { UserDoc } from "./types.js";


export const authGoogleReqMiddleware: Handler = async (req, res, next) => {
       const { auth_req_id } = req.query;

       // auth_req_id dari app mit
       if (!auth_req_id)
              throw new AppError(`Invalid Request Parameter`);

       next();
}


const invalidCallbackParametersError = new AppError(`Invalid Callback Parameters`, 400);
export const authGoogleCallbackMiddleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
       const { state, code, error } = req.query ?? {};

       // harus ada state , jika tidak sudah pasti request auth invalid
       if (!state || typeof state !== 'string') throw invalidCallbackParametersError;

       let decodedState: { auth_req_id?: string } | null = null;
       try {
              // decode base64 dari nilai state
              const buf = Buffer.from(state, "base64url");
              const json = buf.toString('utf-8');
              decodedState = JSON.parse(json);


              if ("auth_req_id" in decodedState === false) throw invalidCallbackParametersError
       } catch {
              throw new authGoogleCallbackStateInvalidError();
       }

       // cari di db 
       const authReqDoc = await findOneAuthReq(decodedState.auth_req_id);

       if (!authReqDoc) throw new AppError(`Invalid Auth Request`, 404);

       if (authReqDoc.status !== "PENDING")
              throw new AppError(`Auth Request Closed with status ${authReqDoc.status}`, 400);


       // https://oauth2.example.com/auth?error=access_denied
       if (error) {
              await updateAuthReqStatus(authReqDoc.auth_req_id, "FAILED", error.toString());
              throw new AppError(`Auth Failed: ${error}`, 400);
       }

       // cek apakah sudah kedaluarsa  5 menit
       const diffInMinutes = Math.abs(Date.now() - new Date(authReqDoc.created_at).getTime()) / 1000 / 60;
       if (diffInMinutes > 5) {
              await updateAuthReqStatus(authReqDoc.id, "FAILED", `Auth Request Expired`);
              throw new AppError("Auth Request Expired", 400);
       };

       // ini harus ada  : https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
       if (!code || typeof code !== 'string') {
              await updateAuthReqStatus(authReqDoc.auth_req_id, "FAILED", `Authorization code is missing`);
              throw new AppError("Authorization code is missing", 400);
       }

       res.locals.authReqDoc = authReqDoc;

       next();
}


export const authGoogleCheckRequestMiddleware = authGoogleReqMiddleware;




type jwtDecoded = jwt.JwtPayload & {
       sub: string,
       role: string
}

export const authMiddleware = async (req: Request & {user : UserDoc}, res: Response, next: NextFunction) => {
       const authHeader = req.headers.authorization;
       if (!authHeader?.startsWith('Bearer ')) {
              return res.status(401).json({ message: "Invalid Token Format" });
       }

       const token = authHeader.split(' ')[1];
       const decoded = jwt.verify(token, process.env.JWT_SECRET as string);


       if (typeof decoded === 'string' || !decoded.sub) {
              return res.status(401).json({ message: "Payload token invalid" });
       }

       if (!ObjectId.isValid(decoded.sub)) {
              return res.status(400).json({ message: "Subject identifier invalaid" });
       }


       const user = await findActiveUserById(decoded.sub);

       if (!user) {
              return res.status(403).json({ message: "User not found or inactive" });
       }

       res.locals.user = user;

       next();
};




