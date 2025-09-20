import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/screenshot", async (req, res) => {
  const { url, width = 1280, height = 720 } = req.query;
  if (!url) return res.status(400).send("Missing ?url param");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: +width, height: +height });
  await page.goto(url, { waitUntil: "networkidle2" });

  const shot = await page.screenshot({ fullPage: false });
  await browser.close();

  res.type("png").send(shot);
});

app.listen(3000, () => console.log("✅ API running on :3000"));
