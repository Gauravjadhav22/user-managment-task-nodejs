"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/authRoute.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middleware/validate");
const userValidation_1 = require("../utils/userValidation");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_1.validate)(userValidation_1.UserRegistrationSchema), authController_1.register);
router.post("/login", (0, validate_1.validate)(userValidation_1.UserLoginSchema), authController_1.login);
exports.default = router;
