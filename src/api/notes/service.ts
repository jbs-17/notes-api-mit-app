import { AppError } from "../../error.js";
import { logger } from "../../utils/logger.js";
import { findNotesByUserId, upsertNotes } from "./repository.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { NoteDoc } from "./types.js";






export const syncNotesService = async (notes: NoteDoc[], userId: string) => {
       if (!notes || notes.length === 0) {
              return { message: "No notes to sync", processed: 0 };
       }

       // membersihkan field dari is_dirty
       const cleanedNotes = notes.map(({ is_dirty, ...rest }: any) => ({
              ...rest,
              user_id: userId,
       }));

       const result = await upsertNotes(cleanedNotes, userId);
       return {
              message: "Sync completed",
              matched: result.matchedCount,
              upserted: result.upsertedCount,
              modified: result.modifiedCount,
       };

}


export const getUpdatedNotesService = async (userId: string, lastSync: number) =>{
              return await findNotesByUserId(userId, lastSync);
              
}