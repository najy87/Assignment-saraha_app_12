import { model, Schema } from "mongoose";
const schema = new Schema(
  {
    // email
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    exppiresAt: {
      // ttl
      type: Date, // 2026-10-3 9:20
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {},
);
export const OTP = model("otp", schema);
