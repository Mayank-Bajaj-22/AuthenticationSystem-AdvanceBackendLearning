import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import {
  loggedInUserController,
  loginUserController,
  refreshAccessTokenController,
  registerUserController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router
  .route("/register")
  .post(validate(registerUserSchema), registerUserController);

router
  .route("/login")
  .post(validate(loginUserSchema), loginUserController);

router
  .route("/me")
  .get(authMiddleware, loggedInUserController);

router
  .route("/refresh-token")
  .post(refreshAccessTokenController);

export default router;