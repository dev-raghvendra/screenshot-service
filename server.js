import express from "express";
import puppeteer from "puppeteer";

const app = express();

// Utility function to validate URLs
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

app.get("/screenshot", async (req, res) => {
  const { url, width = 1280, height = 720 } = req.query;

  if (!url || !isValidUrl(url)) {
    return res.status(400).send("Invalid or missing ?url parameter");
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
    });

    // Navigate and wait until page mostly loaded
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Take a viewport screenshot (not full page)
    const screenshot = await page.screenshot({ fullPage: false });

    res.type("png").send(screenshot);
  } catch (err) {
    console.error("Error taking screenshot:", err.message);
    res.status(500).send("Failed to take screenshot. Check your URL or site availability.");
  } finally {
    if (browser) await browser.close();
  }
});

// Health check endpoint
app.get("/", (req, res) => res.send("✅ Screenshot API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));