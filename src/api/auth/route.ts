import { authGoogleCallbackController, authGoogleCheckRequestController, authGoogleReqController, getProfileController } from "./controller.js";
import { authGoogleCallbackMiddleware, authGoogleCheckRequestMiddleware, authGoogleReqMiddleware, authMiddleware } from "./middleware.js";


import express from "express";
export const authGoogleRoutes = express.Router();

authGoogleRoutes.get("/auth/google/make_request", authGoogleReqMiddleware, authGoogleReqController);

authGoogleRoutes.get("/auth/google/callback", authGoogleCallbackMiddleware, authGoogleCallbackController);

authGoogleRoutes.get("/auth/google/check_request", authGoogleCheckRequestMiddleware, authGoogleCheckRequestController);

authGoogleRoutes.get("/user/profile", authMiddleware, getProfileController);

