// routes/userRoute.ts
import { Router } from "express";
import {
    getUserById,
    updateUser,
    deleteUser,
    listUsers,
    makeAdmin,
    getMe,
    disableUser,
} from "../controllers/userController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
    UserUpdateSchema,
} from "../utils/userValidation";
import { ROLES } from "../constants";

const router = Router();

router.use(authenticateToken);

router.get("/", authorizeRole(ROLES.ADMIN), listUsers); // Only admins can list all users
router.get("/get-me", getMe);
router.get("/:id", getUserById); // Anyone can get their own user data
router.put("/:id", authorizeRole(ROLES.ADMIN,ROLES.USER),validate(UserUpdateSchema), updateUser); // Admin and user can update their own data
router.delete("/:id", deleteUser); // Admin and user can delete their own account
router.put('/make-admin/:id',authorizeRole(ROLES.ADMIN),makeAdmin)//only admin can do this
router.put('/disable/:id',disableUser)


export default router;
