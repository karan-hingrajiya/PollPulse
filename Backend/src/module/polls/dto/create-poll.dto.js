import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

const options = Joi.object({
  text: Joi.string().min(2).required(),
});

const question = Joi.object({
  text: Joi.string().min(6).max(1000).required(),
  isMandatory: Joi.boolean().default(false),
  options: Joi.array().items(options).min(2).required(),
});

//learned new : in joi if we need to define structures or complex arrays of object like structure we can do something like first that specific key contains only [] array data with .array() method and then we can define inside that array that we need every elem to be string,boolean or any other datatype here we need object so we define object then inside that object structures or key that we need.

class createPollDto extends BaseDto {
  static schema = Joi.object({
    title: Joi.string().min(2).max(300).required(),
    description: Joi.string().min(10).max(1000),
    isPublished: Joi.boolean().default(false),
    isAnonymous: Joi.boolean().default(false),
    autoPublishOnExpiry: Joi.boolean().default(false),
    expiresAt: Joi.date(),
    questions: Joi.array().items(question).min(1).required(),
  });
}

export default createPollDto;
