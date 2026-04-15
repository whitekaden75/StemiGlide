import { Router } from "express";
import {
  getCurrentItemPrices,
  getRecentOrders,
  patchShipOrder,
  patchItemPrice,
  patchOrderPrice,
  postCheckoutSession,
  postInquiry,
} from "../controllers/inquiryController.js";

export const inquiryRouter = Router();

inquiryRouter.get("/orders", getRecentOrders);
inquiryRouter.get("/item-prices", getCurrentItemPrices);
inquiryRouter.patch("/item-prices", patchItemPrice);
inquiryRouter.patch("/orders/:id/price", patchOrderPrice);
inquiryRouter.patch("/orders/:id/ship", patchShipOrder);
inquiryRouter.post("/checkout-session", postCheckoutSession);
inquiryRouter.post("/", postInquiry);
