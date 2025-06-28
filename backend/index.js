import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js"
import { app, server } from "./lib/socket.js";
import translateRoutes from "./routes/translate.route.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/translate", translateRoutes);

  app.use(express.static(path.join(__dirname, "/frontend/dist")));

 // Only match valid frontend routes, not malformed paths
app.get(/^\/(?!api|.*:).*$/, (_, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});



server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});