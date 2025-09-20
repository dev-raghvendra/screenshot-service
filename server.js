import express from "express";
import puppeteer from "puppeteer";

const app = express();

// Utility to validate URLs
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

    // Go to the URL and wait until DOM is loaded
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait until the page is fully painted (JS executed)
    await page.waitForFunction(
      () => document.readyState === "complete",
      { timeout: 15000 }
    );

    // Optional small delay for UI animations or lazy-load
    await page.waitForTimeout(500);

    // Take viewport screenshot only (100vh)
    const screenshot = await page.screenshot({ fullPage: false });

    res.type("png").send(screenshot);
  } catch (err) {
    console.error(`[ERROR] Screenshot failed for ${url}:`, err.message);

    if (err.name === "TimeoutError") {
      res
        .status(504)
        .send(
          "Timeout: page took too long to render. Consider a simpler or reachable URL."
        );
    } else {
      res.status(500).send("Failed to take screenshot. Check the URL or site.");
    }
  } finally {
    if (browser) await browser.close();
  }
});

// Health check endpoint
app.get("/", (req, res) => res.send("✅ Puppeteer Screenshot API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));