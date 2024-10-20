"use strict";
// src/middleware/authMiddleware.ts
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
exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const customError_1 = __importDefault(require("../utils/customError"));
const prisma = new client_1.PrismaClient();
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || '';
    console.log(token, "fdssssssssssss");
    if (!token) {
        return next(new customError_1.default({ message: "Unauthorized", status: 401 }));
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(user);
        if (err)
            return res.status(403).json({ message: "Forbidden:session expired" });
        // @ts-ignore
        req.user = user;
        // @ts-ignore
        const userId = user === null || user === void 0 ? void 0 : user.id;
        if (!userId) {
            return res.status(400).json({ message: "Invalid token payload" });
        }
        const dbUser = yield prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (dbUser) {
            // @ts-ignore
            req.role = dbUser.role.name;
        }
        next();
    }));
});
exports.authenticateToken = authenticateToken;
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole) {
            return next(new customError_1.default({ message: "Access denied: No role assigned", status: 400 }));
        }
        if (!allowedRoles.includes(userRole)) {
            return next(new customError_1.default({ message: "Access denied: You don't have permission", status: 403 }));
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
