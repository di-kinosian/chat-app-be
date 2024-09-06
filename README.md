# Chat Application Server

This is a Node.js server for a chat application that provides real-time messaging functionality using WebSockets (Socket.IO) and REST APIs. It utilizes MongoDB for data persistence and supports CORS for cross-origin resource sharing.

## Features

- **REST API** for creating, updating, and deleting chat rooms.
- **WebSocket support** for real-time messaging.
- **MongoDB integration** for storing chats and messages.
- **Auto-reply bot** that sends a random quote after a message is received.
- **CORS** support with configurable allowed origins.

## Prerequisites

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MongoDB** (local or cloud-based)
- **Git** (optional, for cloning the repository)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory and add the following:**
   ```env
   PORT=4000
   MONGO_DB_URI=mongodb://localhost:27017/your-database-name
   SOCKET_ORIGINS=http://localhost:3000,http://your-frontend-domain.com
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

   The server will be running on `http://localhost:4000`.

## API Endpoints

### Create a New Chat
- **URL:** `/chats`
- **Method:** `POST`
- **Description:** Creates a new chat room.
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "chat_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "messages": []
  }
  ```

### Edit an Existing Chat
- **URL:** `/chats/:id`
- **Method:** `PUT`
- **Description:** Updates the details of an existing chat room.
- **Request Parameters:**
  - `id` (string): ID of the chat room.
- **Request Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "chat_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "messages": []
  }
  ```

### Delete a Chat
- **URL:** `/chats/:id`
- **Method:** `DELETE`
- **Description:** Deletes a chat room.
- **Request Parameters:**
  - `id` (string): ID of the chat room.
- **Response:**
  ```json
  {
    "message": "Chat deleted successfully"
  }
  ```

### Get Details of a Chat by ID
- **URL:** `/chats/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific chat room, including all messages.
- **Request Parameters:**
  - `id` (string): ID of the chat room.
- **Response:**
  ```json
  {
    "_id": "chat_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "messages": [
      {
        "content": "Hello!",
        "sender": "User",
        "timestamp": "2024-09-04T12:34:56.789Z"
      }
    ]
  }
  ```

### Send a Message to a Chat
- **URL:** `/chats/:id/messages`
- **Method:** `POST`
- **Description:** Sends a new message to a specific chat room.
- **Request Parameters:**
  - `id` (string): ID of the chat room.
- **Request Body:**
  ```json
  {
    "content": "Hello, how are you?"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "chat_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "messages": [
      {
        "content": "Hello, how are you?",
        "sender": "User",
        "timestamp": "2024-09-04T12:34:56.789Z"
      }
    ]
  }
  ```

### Edit a Message in a Chat
- **URL:** `/chats/:chatId/messages/:messageId`
- **Method:** `PUT`
- **Description:** Edits an existing message in a chat room.
- **Request Parameters:**
  - `chatId` (string): ID of the chat room.
  - `messageId` (string): ID of the message.
- **Request Body:**
  ```json
  {
    "content": "Updated message content"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "chat_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "messages": [
      {
        "_id": "message_id",
        "content": "Updated message content",
        "sender": "User",
        "timestamp": "2024-09-04T12:34:56.789Z"
      }
    ]
  }
  ```

### Get All Chats with the Last Message
- **URL:** `/chats`
- **Method:** `GET`
- **Description:** Retrieves a list of all chat rooms, including the last message sent in each.
- **Response:**
  ```json
  [
    {
      "id": "chat_id",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://i.pravatar.cc/150?img=1",
      "lastMessage": {
        "content": "Last message content",
        "sender": "User",
        "timestamp": "2024-09-04T12:34:56.789Z"
      }
    }
  ]
  ```

## WebSocket Events

### Receive Messages in Real-Time
- **Event:** `message`
- **Description:** Listens for new messages in the chat room.
- **Payload:**
  ```javascript
  socket.on('message', (chat) => {
    console.log('New message received', chat);
  });
  ```

### Receive Updated Messages
- **Event:** `messageUpdated`
- **Description:** Listens for updates to existing messages in the chat room.
- **Payload:**
  ```javascript
  socket.on('messageUpdated', (chat) => {
    console.log('Message updated', chat);
  });
  ```
