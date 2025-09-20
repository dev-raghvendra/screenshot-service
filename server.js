import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import captureWebsite from "capture-website";
import { randomUUID } from "crypto";
import fs from "fs/promises";

const app = express();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/screenshot", async (req, res) => {
const { url, width = 900, height = 563 } = req.query;

if (!url) return res.status(400).send("Invalid or missing ?url parameter");

// Generate a unique filename per request
const filename = screenshot-${randomUUID()}.webp;
const filePath = path.join(__dirname, filename);

try {
// Capture screenshot and save to disk
await captureWebsite.file(url, filePath, {
width: parseInt(width),
height: parseInt(height),
quality:0.5,
launchOptions: {
args: ["--no-sandbox", "--disable-setuid-sandbox"],
},
});

// Send the file to the client  
res.sendFile(filePath, (err) => {  
  // Delete the file after sending to avoid clutter  
  fs.unlink(filePath).catch((err) =>  
    console.error("Failed to delete temp screenshot:", err)  
  );  

  if (err) {  
    console.error("Error sending file:", err);  
    res.status(500).send("Failed to send screenshot");  
  }  
});

} catch (err) {
console.error([ERROR] Failed to capture screenshot for ${url}:, err.message);
res.status(500).send("Failed to take screenshot. Check the URL or site.");
}
});

// Health check
app.get("/", (req, res) => res.send("✅ Screenshot API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));

