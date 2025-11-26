// Simple test server without MongoDB
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Backend is running (test mode without MongoDB)",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    version: "1.0.0",
  });
});

app.listen(PORT, () => {
  console.log(`✓ Test server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Test endpoint: http://localhost:${PORT}/api/test`);
});
