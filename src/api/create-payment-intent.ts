import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";

dotenv.config({ override: true });

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  return new Stripe(key);
}

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CheckoutCustomer = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
};

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
    const { cart, customer } = req.body as {
      cart: CartItem[];
      customer: CheckoutCustomer;
    };

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    if (!customer?.email) {
      return res.status(400).json({
        error: "Customer email is required",
      });
    }

    const amount = cart.reduce((total, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        throw new Error("Invalid cart item");
      }

      return total + Math.round(price * 100) * quantity;
    }, 0);

    if (amount < 50) {
      return res.status(400).json({
        error: "Order total must be at least $0.50",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customer.email,
      metadata: {
        customer_name: customer.name || "",
        customer_email: customer.email || "",
        customer_phone: customer.phone || "",
        customer_city: customer.city || "",
        customer_country: customer.country || "",
        customer_zip: customer.zip || "",
      },
      shipping: customer.name && customer.address ? {
        name: customer.name,
        address: {
          line1: customer.address || "",
          city: customer.city || "",
          postal_code: customer.zip || "",
          country: customer.country || "US",
        },
        phone: customer.phone || undefined,
      } : undefined,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    });
  } catch (error) {
    console.error("Create PaymentIntent error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to create payment",
    });
  }
}
