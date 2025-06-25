import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Used to store online users for private messaging
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit updated online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Group Chat: Join a room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${userId} joined room ${roomId}`);
  });

  // ✅ Group Chat: Handle message and broadcast to group
  socket.on("groupMessage", (messageData) => {
    const { roomId, text, image } = messageData;

    if (!roomId || (!text && !image)) return;

    const newMessage = {
      senderId: userId,
      roomId,
      text,
      image,
      createdAt: new Date(),
    };

    // Broadcast to everyone in the room (including sender if needed)
    io.to(roomId).emit("groupMessage", newMessage);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
