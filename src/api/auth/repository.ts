import { getCollection } from "../../utils/db.connection.js";
import { AuthReqDoc, AuthReqStatus, UserDoc } from "./types.js";
import { ObjectId } from "mongodb";



export async function insertAuthGoogleReqId(auth_req_id: string, auth_google_url: string) {
       const col = await getCollection<AuthReqDoc>("auth_google_requests");

       await col.insertOne({
              auth_req_id,
              auth_google_url,
              status: "PENDING",
              created_at: new Date(),
              updated_at: new Date(),
              message: "Waiting for callback",
              token: null
       });

       return
}


export async function findOneAuthReq(auth_req_id: string) {
       const col = await getCollection<AuthReqDoc>("auth_google_requests");


       const doc = await col.findOne({ auth_req_id });

       if (!doc) return null;

       const { _id, ...data } = doc;

       return { id: _id.toString(), ...data };
}

export async function updateAuthReqStatusSuccess(auth_req_id: string, token: string) {
       const col = await getCollection<AuthReqDoc>("auth_google_requests");

       const doc = await col.findOneAndUpdate({ auth_req_id }, { $set: { status: "SUCCESS", updated_at: new Date(), message: "Auth Success! Keep the token for authorization!", auth_google_url: null, token } }, { returnDocument: "after" });

       if (!doc) return null;

       const { _id, ...data } = doc;

       return { id: _id.toString(), ...data };

}

export async function updateAuthReqStatusExpired(auth_req_id: string) {
       const col = await getCollection<AuthReqDoc>("auth_google_requests");

       const doc = await col.findOneAndUpdate({ auth_req_id }, { $set: { status: "EXPIRED", updated_at: new Date(), message: "Auth Link Expired", auth_google_url: null, token: null } }, { returnDocument: "after" });

       if (!doc) return null;

       const { _id, ...data } = doc;

       return { id: _id.toString(), ...data };

}

export async function updateAuthReqStatusFailed(auth_req_id: string, message = "Auth Failed") {
       const col = await getCollection<AuthReqDoc>("auth_google_requests");

       const doc = await col.findOneAndUpdate({ auth_req_id }, { $set: { status: "FAILED", updated_at: new Date(), message, auth_google_url: null, token: null } }, { returnDocument: "after" });

       if (!doc) return null;

       const { _id, ...data } = doc;

       return { id: _id.toString(), ...data };

}




/**
 * 
 * @param sub id dari mongo db 
 * @returns 
 */
export async function findActiveUserById(sub: string) {
       const col = await getCollection<UserDoc>("users");

       const _id = new ObjectId(sub);

       const user = await col.findOne({ _id, "security.is_active": true });

       if (!user) return null;
       const { _id: ___, ...userData } = user;

       return { id: _id.toString(), ...userData };
}


export async function findOneAndUpdate(data: Partial<UserDoc>) {
       const col = await getCollection<UserDoc>("users");

       if (!data.essential?.google_id) throw new Error("Google ID is required");

       const { _id, ...user } = await col.findOneAndUpdate({
              "essential.google_id": data.essential.google_id
       }, {
              $setOnInsert: {
                     "essential.google_id": data.essential.google_id,
                     "timestamps.created_at": new Date(),
                     "security.is_active": true,
                     "security.role": "REGULAR",
                     ...(data.base_activity?.registration_ip && { "base_activity.registration_ip": data.base_activity.registration_ip }),
              },
              $set: {
                     "base_activity.last_access": new Date(),
                     "timestamps.updated_at": new Date(),

                     ...(data.essential.google_scope && { "essential.google_scope": data.essential.google_scope }),

                     ...(data.essential.email && { "essential.email": data.essential.email }),

                     ...(data.essential.name && { "essential.name": data.essential.name }),

                     ...(data.essential.picture && { "essential.picture": data.essential.picture }),

                     ...(data.essential.refresh_token && { "essential.refresh_token": data.essential.refresh_token }),

                     ...(data.base_activity?.last_ip && { "base_activity.last_ip": data.base_activity.last_ip }),
              }
       }, {
              upsert: true, // update or insert merge
              returnDocument: "after"
       });

       return { id: _id.toString(), ...user };
}











