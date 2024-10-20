import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoute";
import userRoutes from './routes/userRoute'; // Assuming correct userRoutes import path
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware";
import { authenticateToken } from "./middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";
import cors from "cors"

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json()); 

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.send('<h1>App is alive..</h1>');
});


// Auth and User Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use(errorHandlerMiddleware);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
