require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

const getRandomAvatar = () =>
  `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50) + 1}`;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const chatSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  avatar: String,
  messages: [
    {
      content: String,
      sender: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Create a new chat
app.post("/chats", async (req, res) => {
  const { firstName, lastName } = req.body;
  console.log({ firstName, lastName });
  const chat = new Chat({
    firstName,
    lastName,
    messages: [],
    avatar: getRandomAvatar(),
  });
  await chat.save();
  res.status(201).send(chat);
});

// Edit an existing chat
app.put("/chats/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  const chat = await Chat.findByIdAndUpdate(
    id,
    { firstName, lastName },
    { new: true },
  );
  if (!chat) {
    return res.status(404).send({ message: "Chat not found" });
  }
  res.send(chat);
});

// Delete a chat
app.delete("/chats/:id", async (req, res) => {
  const { id } = req.params;
  const chat = await Chat.findByIdAndDelete(id);
  if (!chat) {
    return res.status(404).send({ message: "Chat not found" });
  }
  res.send({ message: "Chat deleted successfully" });
});

app.get("/chats/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the chat by ID
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }

    // Send the chat object, which includes all messages
    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// Send a message to a chat
app.post("/chats/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).send({ message: "Chat not found" });
  }

  chat.messages.push({ content, sender: "User" });
  await chat.save();

  // Notify the client via WebSocket
  io.emit("message", chat);

  // Auto-reply after 3 seconds
  setTimeout(async () => {
    const response = await axios.get("https://api.quotable.io/random");
    chat.messages.push({ content: response.data.content, sender: "System" });
    await chat.save();
    io.emit("message", chat);
  }, 3000);

  res.send(chat);
});

// Get all chats with the last message
app.get("/chats", async (req, res) => {
  const chats = await Chat.find().sort({ updatedAt: -1 }).lean();
  const chatList = chats.map((chat) => ({
    id: chat._id,
    firstName: chat.firstName,
    lastName: chat.lastName,
    lastMessage: chat.messages[chat.messages.length - 1],
    avatar: chat.avatar,
  }));
  res.send(chatList);
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join a specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`Client joined chat: ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Edit a message in a chat
app.put("/chats/:chatId/messages/:messageId", async (req, res) => {
  const { chatId, messageId } = req.params;
  const { content } = req.body;

  console.log({ chatId, messageId, content });
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).send({ message: "Message not found" });
    }

    message.content = content;
    await chat.save();

    // Notify the client via WebSocket
    io.emit("messageUpdated", chat);

    res.send(chat);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).send({ message: "Server error" });
  }
});
