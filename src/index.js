import express from "express";
import { connectDB } from "./DB/connection.js";
import { authRouter, massegeRouter, userRouter } from "./modules/index.js";
const app = express();
const port = 3000;
import cors from "cors";
import { redisConnect } from "./DB/redis.connection.js";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// database connection
connectDB();
redisConnect();

// Middleware
app.use(express.json()); // pasing data from body raw
app.use("/uploads", express.static("uploads"));
app.use(cors("*"));
app.use(helmet());
const limit = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  limit: 3,
  handler: (req, res, next) => {
    throw new Error("too many attemps", { cause: 429 });
  },
  legacyHeaders: false,
});

// Routing
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/massege", massegeRouter);
app.use(limit);
app.use((error, req, res, next) => {
  if (error.massege == "jwt expired")
    error.massege = "token is expired , please login again";
  return res.status(error.cause || 500).json({
    massege: error.massege,
    details: error.details?.length == 0 ? undefined : error.details,
    stack: error.stack,
    success: false,
  });
});

app.get("/", (req, res, next) => {
  return res.send("done");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
