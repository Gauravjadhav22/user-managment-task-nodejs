"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = exports.makeAdmin = exports.disableUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getMe = void 0;
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const responseFormater_1 = require("../utils/responseFormater");
const customError_1 = __importDefault(require("../utils/customError"));
const prisma = new client_1.PrismaClient();
// Get Me
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: requestingUserId }, select: {
                firstName: true, lastName: true, disable: true, email: true, phone: true, avatar: true, id: true, role: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json((0, responseFormater_1.FormatResponse)({ data: user }));
    }
    catch (error) {
        console.error("Get user error:", error);
        next(error);
    }
});
exports.getMe = getMe;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    //   @ts-ignore
    const requestingRole = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.role;
    try {
        if (userId !== requestingUserId && requestingRole !== constants_1.ROLES.ADMIN) {
            return next(new customError_1.default({ message: "Access denied", status: 403 }));
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId }, select: {
                firstName: true, lastName: true, disable: true, email: true, phone: true, avatar: true, id: true, role: true
            }
        });
        if (!user) {
            return next(new customError_1.default({ message: "User not found", status: 404 }));
        }
        res.status(200).json((0, responseFormater_1.FormatResponse)({ data: user }));
    }
    catch (error) {
        console.error("Get user error:", error);
        next(error);
    }
});
exports.getUserById = getUserById;
// Update user
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    //   @ts-ignore
    const requestingUserId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Regular users can only update their own profile
    if (constants_1.ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return res.status(403).json({ message: "Access denied" });
    }
    const { firstName, lastName, email, phone } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        const emailExist = yield prisma.user.findFirst({
            where: {
                AND: [
                    { email: email },
                    { id: { not: userId } }
                ]
            }
        });
        // Ensure the user exists
        if (!user) {
            return next(new customError_1.default({ message: "User not found", status: 404 }));
        }
        if (emailExist) {
            return next(new customError_1.default({ message: "email already exist", status: 400 }));
        }
        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && constants_1.ROLES.ADMIN !== requestingUserRole) {
            return next(new customError_1.default({ message: "Only admin can update other users", status: 403 }));
        }
        // Restrict for an admin trying to update another admin's data
        if (constants_1.ROLES.ADMIN === requestingUserRole && constants_1.ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new customError_1.default({ message: "You cannot update another Admin's data", status: 403 }));
        }
        // Update the user's data
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, email, phone },
            select: {
                firstName: true, lastName: true, email: true, disable: true, phone: true, avatar: true, id: true, role: true
            }
        });
        return res.status(200).json((0, responseFormater_1.FormatResponse)({ data: updatedUser, message: "Updated successfully" }));
    }
    catch (error) {
        console.error("Update user error:", error);
        return next(error);
    }
});
exports.updateUser = updateUser;
// Delete
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    //   @ts-ignore
    const requestingUserId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Regular users can only update their own profile
    if (constants_1.ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return next(new customError_1.default({ message: "Access denied", status: 403 }));
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        // Ensure the user exists
        if (!user) {
            return next(new customError_1.default({ message: "User not found", status: 404 }));
        }
        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && constants_1.ROLES.ADMIN !== requestingUserRole) {
            return next(new customError_1.default({ message: "Only admin can delete other users", status: 403 }));
        }
        // Restrict for an admin trying to update another admin's data
        if (constants_1.ROLES.ADMIN === requestingUserRole && constants_1.ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new customError_1.default({ message: "You cannot delate another Admin", status: 403 }));
        }
        yield prisma.user.delete({ where: { id: userId } });
        res.status(200).json((0, responseFormater_1.FormatResponse)({ message: "deleted successfully." }));
    }
    catch (error) {
        console.error("Delete user error:", error);
        next(error);
    }
});
exports.deleteUser = deleteUser;
// Disable user
const disableUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { disable } = req.body;
    console.log(disable);
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    //   @ts-ignore
    const requestingUserId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Regular users can only update their own profile
    if (constants_1.ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return next(new customError_1.default({ message: "Access denied", status: 403 }));
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        // Ensure the user exists
        if (!user) {
            return next(new customError_1.default({ message: "User not found", status: 404 }));
        }
        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && constants_1.ROLES.ADMIN !== requestingUserRole) {
            return next(new customError_1.default({ message: "Only admin can disable other users", status: 403 }));
        }
        // Restrict for an admin trying to update another admin's data
        if (constants_1.ROLES.ADMIN === requestingUserRole && constants_1.ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new customError_1.default({ message: "You cannot disable another Admin's data", status: 403 }));
        }
        yield prisma.user.update({ where: { id: userId }, data: { disable } });
        res.status(200).json((0, responseFormater_1.FormatResponse)({ message: "disabled successfully." }));
    }
    catch (error) {
        console.error("Delete user error:", error);
        next(error);
    }
});
exports.disableUser = disableUser;
// make user an admin
const makeAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //   @ts-ignore
    const userId = parseInt(req.params.id);
    if (!userId) {
        next(new customError_1.default({ message: "invalid userId" }));
    }
    try {
        const user = yield prisma.user.update({ where: { id: userId }, data: { role: constants_1.ROLES.ADMIN } });
        res.status(200).json((0, responseFormater_1.FormatResponse)({ message: `${user === null || user === void 0 ? void 0 : user.firstName} is now a ADMIN.` }));
    }
    catch (error) {
        console.error("Delete user error:", error);
        next(error);
    }
});
exports.makeAdmin = makeAdmin;
// List all users with filters (Admin only)
const listUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phone, role } = req.query;
    try {
        const users = yield prisma.user.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (firstName && { firstName: { contains: String(firstName) } })), (lastName && { lastName: { contains: String(lastName) } })), (email && { email: { contains: String(email) } })), (phone && { phone: { contains: String(phone) } })), ((role === constants_1.ROLES.USER || role === constants_1.ROLES.ADMIN) && { role: role })),
            select: {
                firstName: true, disable: true, lastName: true, email: true, phone: true, avatar: true, id: true, role: true
            }
        });
        res.status(200).json((0, responseFormater_1.FormatResponse)({ data: users }));
    }
    catch (error) {
        console.error("List users error:", error);
        next(error);
    }
});
exports.listUsers = listUsers;
