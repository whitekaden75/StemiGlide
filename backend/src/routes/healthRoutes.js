import { Router } from "express";
import { getHealth, getRequestIp } from "../controllers/healthController.js";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/ip", getRequestIp);
