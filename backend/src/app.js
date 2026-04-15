import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", true);

  app.use(
    cors({
      origin: env.clientOrigin,
    }),
  );
  app.use(requestLogger);
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      name: "StemiGlide API",
      status: "ok",
      docs: {
        health: "/api/health",
        ip: "/api/health/ip",
        testimonials: "/api/testimonials",
        inquiries: "/api/inquiries",
      },
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
