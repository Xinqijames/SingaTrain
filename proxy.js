// proxy.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_BASE = "https://datamall2.mytransport.sg/ltaodataservice";
const ACCOUNT_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // ← replace with your actual key

app.get("/api/*", async (req, res) => {
  const target = req.params[0];
  const query = req.url.split("?")[1] || "";
  const url = `${API_BASE}/${target}${query ? "?" + query : ""}`;

  try {
    const r = await fetch(url, {
      headers: { AccountKey: ACCOUNT_KEY, accept: "application/json" },
    });
    const text = await r.text();
    res.set("Access-Control-Allow-Origin", "*");
    res.type("application/json").send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Proxy running at http://localhost:${PORT}`));