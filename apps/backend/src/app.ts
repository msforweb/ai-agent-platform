import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AI Agent Platform",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});