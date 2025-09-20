import express from "express";
import path from "path"

const app = express();
import captureWebsite from 'capture-website';




app.get("/screenshot", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Invalid or missing ?url parameter");
  }

  try{
    const img = await captureWebsite.file('https://sindresorhus.com', 'screenshot.png');
 const filePath = path.join(__dirname, 'screenshot.png'); // Construct absolute path
      res.status(200).sendFile(filePath);
  }catch(e) {
    console.error(e)
  }
  
});

// Health check endpoint
app.get("/", (req, res) => res.send("✅ Puppeteer Screenshot API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));