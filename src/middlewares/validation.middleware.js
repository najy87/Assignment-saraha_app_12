import { BadRequestException, SYS_GENDER, SYS_ROLE } from "../common/index.js";
import joi from "joi";
export const isValid = (schema) => {
  return (req, res, next) => {
    // layer of validation
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
    });

    if (validationResult.error) {
      let errorMasseges = validationResult.error.details.map((err) => {
        return { massege: err.message, path: err.path[0] };
      });
      // console.log(errorMasseges);
      throw new BadRequestException("validation failed", errorMasseges);
    }

    next();
  };
};

export const generalFildes = {
  userName: joi
    .string()
    .min(2) // length
    .max(20)
    .trim() // length
    .required()
    .messages({
      "string.min": "user name must be atleast 2 chars",
      "any.required": "user name is required ",
      "string.base": "userName must be a string",
    }),
  email: joi
    .string()
    // .email({ maxDomainSegments: 3 })
    .pattern(/^\w{1,100}@(gmail|yahoo|icloud){1}(.com|.edu|.eg|.net){1,3}$/)
    .messages({
      "string.pattern.base": "invalid email",
    }),
  phoneNumber: joi
    .string()
    .pattern(/^(00201|01|\+201)[0-25]{1}[0-9]{8}$/)
    .messages({
      "string.pattern.base": "invalid phone number for egypt",
    }),
  gender: joi
    .number()
    .valid(...Object.values(SYS_GENDER)) // spread operator
    .default(0),
  role: joi
    .number()
    .valid(...Object.values(SYS_ROLE))
    .default(0),
  password: joi
    .string()
    .required()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .messages({
      "string.pattern.base":
        "password must be a strong which contain uppercase , lowercase ,special char ,digit and atleast 8 char",
    }),
  repassword: joi
    .valid(joi.ref("password"))
    .messages({ "any.only": "repassword must be match password" }),
};
