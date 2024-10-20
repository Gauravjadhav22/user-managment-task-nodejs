// routes/authRoute.ts
import { Router } from "express";
import { register, login } from "../controllers/authController";
import { validate } from "../middleware/validate";
import {
    UserRegistrationSchema,
    UserLoginSchema,
  } from "../utils/userValidation";
const router = Router();

router.post("/register",validate(UserRegistrationSchema), register);
router.post("/login",validate(UserLoginSchema), login);

export default router;
