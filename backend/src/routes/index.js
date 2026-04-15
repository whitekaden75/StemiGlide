import { Router } from "express";
import { healthRouter } from "./healthRoutes.js";
import { inquiryRouter } from "./inquiryRoutes.js";
import { testimonialRouter } from "./testimonialRoutes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/inquiries", inquiryRouter);
apiRouter.use("/testimonials", testimonialRouter);
