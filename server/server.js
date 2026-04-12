import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

//ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Initialize express app
const app = express();

//connect to MongoDB

connectDB();

//env check
// console.log(" MONGODB_URL:", process.env.MONGODB_URL);

//Middleware to handle CORS

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static folder for updates
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
app.use('/api/auth',authRoutes);
app.use(errorHandler);

//404 handler
app.use((req, res) => {
  req
    .status(404)
    .json({ success: false, error: "Route not found", statusCode: 404 });
});

//start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});
