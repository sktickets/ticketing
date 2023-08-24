import Stripe from "stripe";

export const stripeSdk = new Stripe(process.env.STRIPE_KEY!, {
	apiVersion: '2023-08-16',
});
