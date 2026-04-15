import Stripe from "stripe";
import { env } from "./env.js";

console.log("Stripe key exists:", !!env.stripeSecretKey);
console.log("Stripe key value:", env.stripeSecretKey);

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-03-31.basil",
});
// this is a simple test to push