import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

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
    phone: string;
    address: string;
    city: string;
    country: string;
    zip: string;
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const { cart, customer } = req.body as {
            cart: CartItem[];
            customer: CheckoutCustomer;
        };

        // Basic validation
        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                error: "Cart is empty",
            });
        }

        if (!customer?.name || !customer?.email) {
            return res.status(400).json({
                error: "Customer name and email are required",
            });
        }

        // Calculate amount in cents
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

        // Stripe's minimum USD PaymentIntent amount is $0.50
        if (amount < 50) {
            return res.status(400).json({
                error: "Order total must be at least $0.50",
            });
        }

        // Create one PaymentIntent for this checkout/order
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",

            automatic_payment_methods: {
                enabled: true,
            },

            receipt_email: customer.email,

            metadata: {
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone || "",
                customer_city: customer.city || "",
                customer_country: customer.country || "",
                customer_zip: customer.zip || "",
            },

            shipping: {
                name: customer.name,
                address: {
                    line1: customer.address,
                    city: customer.city,
                    postal_code: customer.zip,
                    country: customer.country,
                },
                phone: customer.phone || undefined,
            },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount,
        });
    } catch (error) {
        console.error("Create PaymentIntent error:", error);

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Unable to create payment",
        });
    }
}