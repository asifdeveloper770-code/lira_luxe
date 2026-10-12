import { loadStripe } from "@stripe/stripe-js";

const userPublicKey = "pk_live_51UKjtPRDpRbVafPEASYNjjm9zDbwG5v8zJTjjJDNsu0ntSkQKaErMcTrFlVRqrUjcXncL0G76rXaBRykckqcdYzg00Suejf2l8";
const envPubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const STRIPE_PUBLISHABLE_KEY =
  envPubKey && !envPubKey.includes("YOUR_") && envPubKey.startsWith("pk_")
    ? envPubKey
    : userPublicKey;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
