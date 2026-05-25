import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

const answerSchema = Joi.object({
  // mongoDB ObjectIds are exactly 24 hexadecimal characters
  // joi string().hex().length(24) is the standard way to validate them
  questionId: Joi.string().hex().length(24).required(),
  selectedOptionId: Joi.string().hex().length(24).allow(null),
});

class createResponseDto extends BaseDto {
  static schema = Joi.object({
    answers: Joi.array().items(answerSchema).required(),
    fingerprint: Joi.string().trim().max(100).required()
  });
}

export default createResponseDto;
