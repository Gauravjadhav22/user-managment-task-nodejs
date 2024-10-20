"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoute.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validate_1 = require("../middleware/validate");
const userValidation_1 = require("../utils/userValidation");
const constants_1 = require("../constants");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get("/", (0, authMiddleware_1.authorizeRole)(constants_1.ROLES.ADMIN), userController_1.listUsers); // Only admins can list all users
router.get("/get-me", userController_1.getMe);
router.get("/:id", userController_1.getUserById); // Anyone can get their own user data
router.put("/:id", (0, authMiddleware_1.authorizeRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.USER), (0, validate_1.validate)(userValidation_1.UserUpdateSchema), userController_1.updateUser); // Admin and user can update their own data
router.delete("/:id", userController_1.deleteUser); // Admin and user can delete their own account
router.put('/make-admin/:id', (0, authMiddleware_1.authorizeRole)(constants_1.ROLES.ADMIN), userController_1.makeAdmin); //only admin can do this
router.put('/disable/:id', userController_1.disableUser);
exports.default = router;
