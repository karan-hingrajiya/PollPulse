import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class resendVerificationDto extends BaseDto {
  static schema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
  });
}

export default resendVerificationDto;
