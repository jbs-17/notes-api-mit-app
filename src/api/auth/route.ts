import { authGoogleCallbackController, authGoogleCheckRequestController, authGoogleMakeAuthReqController, getProfileController } from "./controller.js";
import { authGoogleCallbackMiddleware, authGoogleCheckRequestMiddleware, authGoogleMakeAuthReqMiddleware, authMiddleware } from "./middleware.js";


import express from "express";
export const authGoogleRoutes = express.Router();

authGoogleRoutes.get("/auth/google/make_request", authGoogleMakeAuthReqMiddleware, authGoogleMakeAuthReqController);

authGoogleRoutes.get("/auth/google/callback", authGoogleCallbackMiddleware, authGoogleCallbackController);

authGoogleRoutes.get("/auth/google/check_request", authGoogleCheckRequestMiddleware, authGoogleCheckRequestController);

authGoogleRoutes.get("/user/profile", authMiddleware, getProfileController);

