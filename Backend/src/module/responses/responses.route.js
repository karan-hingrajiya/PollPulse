import { Router } from "express";
import createResponseDto from "./dto/responses.dto.js";
import { checkAnonymousMiddleware } from "./response.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import * as responseController from "./responses.controller.js";
const responseRouter = Router();

responseRouter.post(
  "/:token",
  validate(createResponseDto),
  checkAnonymousMiddleware,
  responseController.submitResponse,
);

export default responseRouter;
