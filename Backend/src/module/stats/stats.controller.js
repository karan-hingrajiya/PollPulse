import * as statsService from "./stats.service.js";
import ApiResponse from "../../common/utils/api-response.js";

export const getPlatformStats = async (req, res) => {
  const data = await statsService.getPlatformStats();
  ApiResponse.ok(res, "Platform stats fetched", data);
};