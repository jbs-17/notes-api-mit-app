import type { Document} from "mongodb";



export interface NoteDoc {
       string_uid: string;
       string_title: string;
       string_content: string;
       time_created_at: number;
       time_updated_at: number;
       is_deleted: boolean;
       is_dirty: boolean;
       user_id: string;
}


