import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";

dotenv.config({ override: true });

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  return new Stripe(key);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const stripe = getStripe();

  try {
    const { cart, customer } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const origin =
      req.headers.origin ||
      (req.headers.referer ? new URL(req.headers.referer as string).origin : "") ||
      "http://localhost:3000";

    const line_items = cart.map((item: any) => {
      const isValidHttpUrl = typeof item.image === "string" && item.image.startsWith("http");
      return {
        quantity: Math.max(1, Number(item.quantity) || 1),
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(item.price) * 100),
          product_data: {
            name: item.name || "Maison Lira Piece",
            ...(isValidHttpUrl ? { images: [item.image] } : {}),
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.name || "",
        customer_phone: customer?.phone || "",
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    return res.status(200).json({
      id: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Stripe Error",
    });
  }
}
