import type {  Handler } from "express";
import {z} from "zod";
import { AppError } from "../../error.js";


const noteSchema = z.object({
       string_uid: z.string(),
       string_title: z.string().min(1),
       string_content: z.string().min(0),
       time_created_at: z.number(),
       time_updated_at: z.number(),
       bool_deleted: z.boolean()
});
const notesSchema = z.array(noteSchema);
export const syncNotesMiddleware: Handler = async (req, res, next) => {
              await notesSchema.parseAsync(req.body);
              next();
}
export const getUpdatedNotesMiddleware : Handler = async (req, res, next) => {
       const rawLastSync = req.query.lastSync as string;

       // Jika tidak ada lastSync, default ke 0 (untuk perangkat baru/full fetch)
       let lastSync = rawLastSync ? Number.parseInt(rawLastSync) : 0;

       if (isNaN(lastSync)) {
              return next(new AppError("Invalid lastSync parameter", 400));
       }

       res.locals.lastSync = Math.abs(lastSync);
       next();
}
