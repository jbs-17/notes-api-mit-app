import { getCollection } from "../../utils/db.connection.js";
import { NoteDoc } from "./types.js";
import { AnyBulkWriteOperation, ObjectId } from "mongodb";




/**
 * membuat perubahan atau menulis note baru  
 * @param notes 
 * @param user_id 
 * @returns 
 */
export const upsertNotes = async (notes: NoteDoc[], user_id: string) => {
       const col = await getCollection<NoteDoc>("notes");

       const operations: AnyBulkWriteOperation<NoteDoc>[] = notes.flatMap(note => [
              // Operation 1: Update jika lebih baru
              {
                     updateOne: {
                            filter: {
                                   string_uid: note.string_uid,
                                   user_id,
                                   time_updated_at: { $lt: note.time_updated_at }
                            },
                            update: { $set: { ...note, user_id } },
                            upsert: false
                     }
              },
              // Operation 2: Insert jika benar-benar baru
              {
                     updateOne: {
                            filter: { string_uid: note.string_uid },
                            update: { $setOnInsert: { ...note, user_id } },
                            upsert: true
                     }
              }
       ]);

       try {
              // ordered: false agar jika ada note bermasalah, yang lain tetap jalan
              return await col.bulkWrite(operations, { ordered: false });
       } catch (err) {
              console.error("Gagal sinkronisasi:", err);
              throw err; 
       }
}

/**
 * untuk ambil perubahan dari terakhir kali mengambil perubahan
 * @param user_id 
 * @param lastSync 
 * @returns 
 */
export const findNotesByUserId = async (user_id: string, lastSync: number) => {
       const col = await getCollection<NoteDoc>("notes");

        return await col.find({
              user_id: user_id,
              // ambil lastSync server yang lebih besar dari lastSync client 
              // mengambil semua note yang belum update di client
               // Jika lastSync = 0, ambil seluruh notes user tersebut
              time_updated_at: { $gt: lastSync },
       })
              .toArray()
              ;

              
}






