import type { Request, Response, NextFunction, Handler } from "express";
import { authGoogleCallbackStateInvalidError, AppError, authGoogleCallbackReqExpiredError } from "../../error.js";
import { findActiveUserById, findOneAuthReq, updateAuthReqStatusExpired, updateAuthReqStatusFailed, updateAuthReqStatusSuccess } from "./repository.js";
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";
import { AuthReqDoc, UserDoc } from "./types.js";
import { nanoid } from "nanoid";
import { authGoogleCheckRequestService } from "./service.js";
import path from "path";
import { fileURLToPath } from "url";

export const authGoogleMakeAuthReqMiddleware: Handler = async (req, res, next) => {
       next();
}

export async function checkExpirationAuthRequest(authReqDoc: AuthReqDoc) {
       let expired = false;
       const diffInMills = Date.now() - authReqDoc.created_at.getTime();
       const diffInMinutes = diffInMills / 1000 / 60;

       if (diffInMinutes > 5 && authReqDoc.status === "PENDING") { // kedaluarsa jika dibuat 5 menit lalu
              authReqDoc = await updateAuthReqStatusExpired(authReqDoc.auth_req_id);
              expired = true;
       }

       return {
              expired,
              authReqDoc
       }
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

       // https://oauth2.example.com/auth?error=access_denied
       if (error) {
              const authReqDocUpdated = await updateAuthReqStatusFailed(authReqDoc.auth_req_id, error.toString());
              return res.status(400).json(authReqDocUpdated);
       }



       // kalau udah sukses
       if (authReqDoc.status === "SUCCESS")
              return res.redirect("/auth-google-success.html");

       // callbacck hanya mnerima yang masih statusnya pending
       if (authReqDoc.status !== "PENDING")
              return res.status(200).json(authReqDoc);

       // jika pending tapi sudah waktu kedaluarsa
       const isExpired = await checkExpirationAuthRequest(authReqDoc);
       if (isExpired.expired) return res.status(400).json(isExpired.authReqDoc);

       // ini harus ada  : https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
       if (!code || typeof code !== 'string') {
              await updateAuthReqStatusFailed(authReqDoc.auth_req_id, `Authorization code is missing`);
              throw new AppError("Authorization code is missing", 400);
       }

       res.locals.authReqDoc = authReqDoc;

       next();
}


export const authGoogleCheckRequestMiddleware: Handler = async (req, res, next) => {

       const { auth_req_id } = req.query;

       const authReqDoc = await authGoogleCheckRequestService(auth_req_id as string);

       if (!authReqDoc) throw new AppError(`Invalid Auth Request`, 404);


       // auth_req_id dari make request
       if (!auth_req_id || typeof auth_req_id !== "string")
              throw new AppError(`Invalid Request Parameter`);



       res.locals.authReqDoc = authReqDoc;
       next();
};




type jwtDecoded = jwt.JwtPayload & {
       sub: string,
       role: string
}

export const authMiddleware = async (req: Request & { user: UserDoc }, res: Response, next: NextFunction) => {
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




