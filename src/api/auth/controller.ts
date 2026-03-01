import type { Handler } from "express";
import { authGoogleMakeAuthReqService, authGoogleCallbackService, authGoogleCheckRequestService } from "./service.js";
import { findOneAuthReq } from "./repository.js";
import { AuthReqDoc, UserDoc } from "./types.js";
import { nanoid } from "nanoid";
import path from "path";



export const authGoogleMakeAuthReqController: Handler = async (req, res, next) => {
       const auth_req_id = nanoid(17);

       const { auth_google_url } = await authGoogleMakeAuthReqService(auth_req_id as string);

       res.json({ auth_google_url, auth_req_id });
}


export const authGoogleCallbackController: Handler = async (req, res, next) => {
       const authReqDoc = res.locals.authReqDoc as Awaited<ReturnType<typeof findOneAuthReq>>;

       const code = req.query.code as string;

       await authGoogleCallbackService(authReqDoc, code, req.ip);

       res.redirect("auth-google-success.html");
}


export const authGoogleCheckRequestController: Handler = async (req, res, next) => {
       res.json(res.locals.authReqDoc as AuthReqDoc);
}



export const getProfileController: Handler = async (req, res, next) => {
       const { essential: { email, name, picture }, timestamps: { created_at, updated_at } } = res.locals.user as UserDoc || {};
       const data = {
              essential: { email, name, picture },
              timestamps: { created_at, updated_at }
       }
       res.json(data);
}