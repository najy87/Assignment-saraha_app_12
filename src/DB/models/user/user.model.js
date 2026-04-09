import { model, Schema } from "mongoose";
import { SYS_GENDER, SYS_ROLE } from "../../../common/index.js";

const schema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 20,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      enum: ["google", "system"],
      default: "system",
    },
    password: {
      type: String,
      required: function () {
        if (this.provider == "google") return false;
        return true;
      },
    },
    gender: {
      type: Number,
      enum: Object.values(SYS_GENDER),
      default: SYS_GENDER.male,
    },
    role: {
      type: Number,
      enum: Object.values(SYS_ROLE),
      default: SYS_ROLE.user,
    },
    phoneNumber: {
      type: String,
      required: function () {
        if (this.email) return false;
        return true;
      },
    },
    profilePic: String,
    coverPic: String,
    isEmailverified: {
      type: Boolean,
      default: true,
    },
    credantialUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    bannedUntil: {
      type: Date,
      default: null,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: true,
    timestamps: true,
    optimisticConcurrency: true,
  },
);
export const User = model("User", schema);
