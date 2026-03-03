import { pullNotesController, pushNotesController } from "./controller.js";
import { pullNotesMiddleware, pushNotesMiddleware } from "./middleware.js";
import { authMiddleware } from "../auth/middleware.js";


import express from "express";
export const notesRoutes = express.Router();

notesRoutes.use(express.json());
notesRoutes.use(authMiddleware);

notesRoutes.post("/notes/push", pushNotesMiddleware, pushNotesController);

notesRoutes.get("/notes/pull", pullNotesMiddleware, pullNotesController);

