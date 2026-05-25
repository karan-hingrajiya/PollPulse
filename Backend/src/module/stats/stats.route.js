import { Router } from "express";
import * as statsController from "./stats.controller.js";

const statsRouter = Router();

// Public route — no auth needed, landing page uses this
statsRouter.get("/", statsController.getPlatformStats);

export default statsRouter;