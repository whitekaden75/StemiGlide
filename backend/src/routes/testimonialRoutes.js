import { Router } from "express";
import {
  getTestimonials,
  getPendingTestimonials,
  patchApproveTestimonial,
  postTestimonial,
} from "../controllers/testimonialController.js";

export const testimonialRouter = Router();

testimonialRouter.get("/", getTestimonials);
testimonialRouter.get("/pending", getPendingTestimonials);
testimonialRouter.post("/", postTestimonial);
testimonialRouter.patch("/:id/approve", patchApproveTestimonial);
