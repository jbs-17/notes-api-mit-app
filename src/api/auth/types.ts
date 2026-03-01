import type { Document} from "mongodb";

export type AuthReqStatus = "PENDING" | "FAILED" | "SUCCESS" | "EXPIRED";


export interface AuthReqDoc {
       auth_req_id : string,
       auth_google_url : string, 
       status : AuthReqStatus,
       message : string,
       created_at : Date,
       updated_at : Date,
       token : string
}


export type UserRole = "REGULAR"

export interface UserDoc {
       essential: {
              google_id: string; // sub dari Google
              google_scope : string[],
              email: string;
              name: string;
              picture: string;
              refresh_token: string;  // buat ambil access token lagi, kalu mau pakai api google lagi sih 
       },
       base_activity: {
              last_access: Date;
              last_ip?: string; 
              registration_ip?: string; 
       },
       security: { 
              role: UserRole;
              is_active: boolean;
       },
       timestamps: {
              created_at: Date;
              updated_at: Date;
       }

}



export type FindAndUpdateUserDto = Partial<UserDoc>;
