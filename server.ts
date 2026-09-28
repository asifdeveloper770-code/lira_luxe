import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

// Load .env with override: true so custom keys in .env take precedence over container defaults
dotenv.config({ override: true });

import handlePaymentIntent from "./api/create-payment-intent";
import handleCheckoutSession from "./api/create-checkout-session";

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes for Stripe Checkout
app.post("/api/create-payment-intent", (req, res) => {
  return handlePaymentIntent(req as any, res as any);
});

app.post("/api/create-checkout-session", (req, res) => {
  return handleCheckoutSession(req as any, res as any);
});

async function start() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lira Luxe server active on http://0.0.0.0:${PORT}`);
  });
}

start();
