import type { Handler } from "express";
import { authGoogleReqService, authGoogleCallbackService, authGoogleCheckRequestService } from "./service.js";
import { findOneAuthReq } from "./repository.js";
import { UserDoc } from "./types.js";



export const authGoogleReqController: Handler = async (req, res, next) => {
       const { auth_req_id } = req.query;

       const { authGoogleUrl } = await authGoogleReqService(auth_req_id as string);

       res.redirect(authGoogleUrl);
}


export const authGoogleCallbackController: Handler = async (req, res, next) => {
       const authReqDoc = res.locals.authReqDoc as Awaited<ReturnType<typeof findOneAuthReq>>;

       const code = req.query.code as string;

       await authGoogleCallbackService(authReqDoc, code, req.ip);

       res.json({ message: "Auth Success" })
}


export const authGoogleCheckRequestController: Handler = async (req, res, next) => {
       const { auth_req_id } = req.query;
       const data = await authGoogleCheckRequestService(auth_req_id as string);

       res.json(data);
}

export const getProfileController: Handler = async (req, res, next) =>{
       const { essential: { email, name, picture }, timestamps: { created_at, updated_at } } = res.locals.user as UserDoc || {};
       const data = {
              essential: { email, name, picture },
              timestamps: { created_at, updated_at }
       }
       res.json(data);
}