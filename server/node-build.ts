import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// API route handler - must come before static files
app.get('/api/ping', (req, res) => {
  const ping = process.env.PING_MESSAGE ?? 'pong';
  res.json({ message: ping });
});

// Serve static files
app.use(express.static(distPath));

// Handle SPA routing - must be after static files and API routes
const handleSpa = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error loading the application');
    }
  });
};

// Handle all other routes with the SPA (must be the last route)
// Using a more compatible catch-all route
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  handleSpa(req, res);
});

// Handle 404 for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
