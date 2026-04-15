import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  dbClient: process.env.DB_CLIENT ?? "postgres",
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbName: process.env.DB_NAME ?? "stemiglide",
  dbUser: process.env.DB_USER ?? "postgres",
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbSsl: process.env.DB_SSL === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeSuccessUrl:
    process.env.STRIPE_SUCCESS_URL ??
    "http://localhost:5173/contact?checkout=success",
  stripeCancelUrl:
    process.env.STRIPE_CANCEL_URL ??
    "http://localhost:5173/contact?checkout=cancel",
  stripeCurrency: process.env.STRIPE_CURRENCY ?? "usd",
};
