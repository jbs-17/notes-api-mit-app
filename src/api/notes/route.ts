import { getUpdatedNotesController, syncNotesController } from "./controller.js";
import { getUpdatedNotesMiddleware, syncNotesMiddleware } from "./middleware.js";
import { authMiddleware } from "../auth/middleware.js";


import express from "express";
export const notesRoutes = express.Router();

notesRoutes.use(express.json());
notesRoutes.use(authMiddleware);

notesRoutes.post("/notes/sync", syncNotesMiddleware, syncNotesController);

notesRoutes.get("/notes/get", getUpdatedNotesMiddleware, getUpdatedNotesController);

