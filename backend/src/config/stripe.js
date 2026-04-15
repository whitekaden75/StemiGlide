import Stripe from "stripe";
import { env } from "./env.js";

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-03-31.basil",
});
