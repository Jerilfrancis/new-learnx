import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import app from "./server/app";
import { seedDatabase } from "./server/config/seed";
import { initSocketIO } from "./server/services/socket";
import express from "express";

const PORT = process.env.PORT || 3000;

import { connectDB } from "./server/config/database";

async function startServer() {
  const server = http.createServer(app);

  // Initialize Socket.IO real-time server
  initSocketIO(server);

  // Vite middleware setup for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, async () => {
    console.log(`[LearnX] Server running on http://localhost:${PORT}`);
    await connectDB();
    await seedDatabase();
  });
}

startServer();
