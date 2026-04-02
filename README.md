# 🎬 YouTube Watch Party

> Watch YouTube videos together, in sync, with friends — no matter where they are.


## What is this?

**YouTube Watch Party** is a real-time web app that lets you create a room, invite friends, and watch YouTube videos together — fully synchronized. Whether you're miles apart or just in different rooms, everyone sees the same frame at the same time.

---

## Features

- 🔐 **User Authentication** — Sign up and log in securely. Your identity follows you across rooms.
- 🏠 **Room Creation & Invite Links** — Spin up a watch party room in seconds and share a link. Anyone with the link can join instantly.
- 💬 **Live Chat** — React, comment, and chat with everyone in the room in real time while the video plays.
- ⚡ **Real-Time Sync** — Powered by WebSockets, play/pause/seek events are broadcast to all participants instantly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Real-Time | Socket.io |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/youtube-watch-party.git
cd youtube-watch-party

# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=4000
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `/client` directory:

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000
```

### Running Locally

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. **Sign up or log in** to get started.
2. **Create a room** — you'll get a unique shareable invite link.
3. **Paste a YouTube URL** into the player.
4. **Share the link** with friends — they join instantly, no account required to watch.
5. **Chat and watch together** — play/pause/seek stays in sync for everyone in real time.

---

## Project Structure

```
youtube-watch-party/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components (Player, Chat, Room)
│   │   ├── pages/        # Route-level pages
│   │   └── context/      # Auth & socket context
├── server/               # Node.js + Express backend
│   ├── routes/           # REST API routes (auth, rooms)
│   ├── socket/           # Socket.io event handlers
│   └── middleware/       # Auth middleware
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## License

[MIT](LICENSE)

---

<p align="center">Built with ❤️ for movie nights, sports watch-alongs, and everything in between.</p>
