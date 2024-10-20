"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute")); // Assuming correct userRoutes import path
const errorHandlerMiddleware_1 = __importDefault(require("./middleware/errorHandlerMiddleware"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5050;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check Route
app.get('/health', (req, res) => {
    res.send('<h1>App is alive..</h1>');
});
// Auth and User Routes
app.use('/api/auth', authRoute_1.default);
app.use('/api/users', userRoute_1.default);
// Error Handling Middleware
app.use(errorHandlerMiddleware_1.default);
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
