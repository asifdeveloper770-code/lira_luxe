import { loadStripe } from "@stripe/stripe-js";

const userPublicKey = "pk_test_51UKjtnEZenGYkPFs4MK1ryDsi1i3qo4tBIwUxGWzX3brlibtpLKSfTlA7rEzte7Wrij4w2dvv8Covax0jMGOzj1e00Pzq1LqSj";
const envPubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const STRIPE_PUBLISHABLE_KEY =
  envPubKey && !envPubKey.includes("YOUR_") && envPubKey.startsWith("pk_")
    ? envPubKey
    : userPublicKey;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
