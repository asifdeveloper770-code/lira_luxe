import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { cart } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: cart.map((item: any) => ({
        quantity: item.quantity,

        price_data: {
          currency: "usd",

          unit_amount: Math.round(item.price * 100),

          product_data: {
            name: item.name,

            images: [item.image],
          },
        },
      })),

      success_url:
        `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${req.headers.origin}/cart`,
    });

    res.status(200).json({
      id: session.id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Stripe Error",
    });
  }
}