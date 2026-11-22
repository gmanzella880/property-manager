import Stripe from "stripe";

let client;
/** The Stripe client, or null when online payments aren't set up (no key). */
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
