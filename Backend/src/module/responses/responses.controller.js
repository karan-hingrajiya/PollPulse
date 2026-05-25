import ApiResponse from "../../common/utils/api-response.js";
import * as responseService from "./responses.service.js";

export const submitResponse = async (req, res) => {
  const result = await responseService.submitResponse(
    req.poll,
    req.user,
    req.body,
  );

  ApiResponse.ok(res, "Response submitted successfully", { result });
};
