import type { Handler } from "express";
import { getUpdatedNotesService, syncNotesService } from "./service.js";
import { NoteDoc} from "./types.js";
import path from "path";
import { UserDoc } from "../auth/types.js";
import { findActiveUserById } from "../auth/repository.js";


export const syncNotesController:Handler = async (req, res, next) => {
       const user = res.locals.user as Awaited<ReturnType<typeof findActiveUserById>>;
       const notes = req.body as NoteDoc[];

       const result = await syncNotesService(notes, user.id);

       res.status(200).json(result);
}


export const getUpdatedNotesController : Handler= async(req, res, next)=>{
       const user = res.locals.user as Awaited<ReturnType<typeof findActiveUserById>>;

       const result = await getUpdatedNotesService(user.id, res.locals.lastSync);

       res.status(200).json(result);
}

