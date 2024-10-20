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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const customError_1 = __importDefault(require("../utils/customError"));
const prisma = new client_1.PrismaClient();
// Register function
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phone, password, passcode = '', avatar = '' } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new customError_1.default({ message: "User already exists with this email", status: 400 }));
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create a new user
        let user;
        console.log(passcode, process.env.ADMIN_PASSCODE);
        if (passcode === process.env.ADMIN_PASSCODE) {
            user = yield prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email: email.toLowerCase(),
                    phone,
                    password: hashedPassword,
                    role: constants_1.ROLES.ADMIN,
                    avatar
                },
            });
        }
        else {
            user = yield prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    password: hashedPassword,
                    role: constants_1.ROLES.USER,
                    avatar
                },
            });
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({
            token,
            data: { user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                } },
            message: "user created successfully"
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        next(error);
    }
});
exports.register = register;
// Login function
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return next(new customError_1.default({ message: "User not found", status: 404 }));
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || '');
        if (!isPasswordValid) {
            return next(new customError_1.default({ message: "Invalid password", status: 401 }));
        }
        console.log(user);
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            token,
            data: { user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                } },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        next(error);
    }
});
exports.login = login;
