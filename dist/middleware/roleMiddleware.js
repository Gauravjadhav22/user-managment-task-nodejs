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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelfOrAdmin = exports.isAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //   @ts-ignore
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if ((user === null || user === void 0 ? void 0 : user.role) !== 'ADMIN') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
});
exports.isAdmin = isAdmin;
// Middleware to check if the user is the owner of the resource or an admin
const isSelfOrAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //   @ts-ignore
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const targetUserId = parseInt(req.params.id);
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (userId !== targetUserId && (user === null || user === void 0 ? void 0 : user.role) !== 'ADMIN') {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    next();
});
exports.isSelfOrAdmin = isSelfOrAdmin;
