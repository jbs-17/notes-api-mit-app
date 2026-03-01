import { AppError } from "../../error.js";
import { logger } from "../../utils/logger.js";
import { findOneAndUpdate, findOneAuthReq, insertAuthGoogleReqId, updateAuthReqStatusExpired, updateAuthReqStatusFailed, updateAuthReqStatusSuccess } from "./repository.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { UserDoc } from "./types.js";


const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;




export async function authGoogleMakeAuthReqService(auth_req_id: string) {
       const stateJSON = JSON.stringify({ auth_req_id });
       const stateEncoded = Buffer.from(stateJSON).toString("base64url");

       const param = new URLSearchParams([
              ["client_id", CLIENT_ID],
              ["redirect_uri", REDIRECT_URI],
              ["response_type", "code"],
              ["scope", "openid email profile"],
              ["access_type", "offline"],
              ["state", stateEncoded],
              ["prompt", "select_account consent"]
       ]);

       const auth_google_url = `https://accounts.google.com/o/oauth2/v2/auth?` + param.toString();

       await insertAuthGoogleReqId(auth_req_id, auth_google_url);

       return { auth_google_url };

}



export async function authGoogleCallbackService(authReqDoc: Awaited<ReturnType<typeof findOneAuthReq>>, code: string, ip?: string) {

       const param = new URLSearchParams();
       param.append("client_id", CLIENT_ID);
       param.append("client_secret", CLIENT_SECRET);
       param.append("redirect_uri", REDIRECT_URI);
       param.append("code", code);
       param.append("grant_type", "authorization_code");

       const get_access_url = `https://oauth2.googleapis.com/token?` + param;

       // tukar kode untuk dapatkan access token, refresh token, dll
       let access_data: { access_token: string, refresh_token: string, expires_in: string, scope: string, token_type: string, id_token: string } | null = null;
       try {

              const access_res = await axios.post(get_access_url, {
                     headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                     }
              });


              access_data = access_res.data;

       } catch (error) {
              await updateAuthReqStatusFailed(authReqDoc.auth_req_id, `Error while get access token : ${error?.message}`);
              throw error
       }


       let user_google_data: null | { sub: string, name: string, picture: string, email: string, email_verified: string } = null;
       try {
              const { data } = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
                     headers: {
                            Authorization: `Bearer ${access_data.access_token}`
                     }
              });

              user_google_data = data;

       } catch (error) {
              await updateAuthReqStatusFailed(authReqDoc.auth_req_id, `Error whiile get user google profile data : ${error?.message}`);
              throw error;
       }



       const user = await findOneAndUpdate({
              essential: {
                     google_id: user_google_data.sub,
                     picture: user_google_data.picture,
                     email: user_google_data.email,
                     name: user_google_data.name,
                     refresh_token: access_data.refresh_token,
                     google_scope: access_data?.scope?.split?.(" ")
              },
              base_activity: {
                     last_ip: ip,
                     registration_ip: ip,
                     last_access: new Date()
              }
       });


       const token = generateAccessToken(user);

       await updateAuthReqStatusSuccess(authReqDoc.auth_req_id, token);

       return
}




export function generateAccessToken(user: Awaited<ReturnType<typeof findOneAndUpdate>>) {
       return jwt.sign(
              {
                     sub: user.id,
                     role: user.security.role
              },
              process.env.JWT_SECRET as string,
              {
                     expiresIn: '30Days'
              }
       );
}


export async function authGoogleCheckRequestService(auth_req_id: string) {
       return await findOneAuthReq(auth_req_id);
}
