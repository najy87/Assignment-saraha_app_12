import joi from "joi";
import { generalFildes } from "../../middlewares/validation.middleware.js";

export const signupSchema = joi
  .object({
    userName: generalFildes.userName,
    email: generalFildes.email,
    phoneNumber: generalFildes.phoneNumber,
    gender: generalFildes.gender,
    role: generalFildes.role,
    password: generalFildes.password,
    repassword: generalFildes.repassword,
  })
  .or("email", "phoneNumber")
  .required();

export const loginSchema = joi
  .object({
    email: generalFildes.email,
    password: generalFildes.password,
  })
  .required();
