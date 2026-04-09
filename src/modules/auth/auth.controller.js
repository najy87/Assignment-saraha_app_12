import { Router } from "express";
import {
  confirmLogin,
  enableTwoFactor,
  updatePassword,
  verifyAndEnableTwoFactor,
} from "./auth.service.js";
import {
  SYS_MASSEGE,
  generateTokens,
  verifyToken,
} from "../../common/index.js";

const router = Router();
import { isAuthentcated } from "../../middlewares/authentcation.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import {
  forgetPassword,
  login,
  loginWithGoogle,
  logout,
  logoutFromAllDevices,
  refreshTokenService,
  sendOtp,
  signup,
  verifyAccount,
} from "./auth.service.js";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  legacyHeaders: false,
  ipv6Subnet: 56,
});

router.use(limit);
router.post(
  "/signup",
  fileUpload().none(), // parsing >> form-data  , inforce non-file
  isValid(signupSchema),
  async (req, res, next) => {
    const createdUser = await signup(req.body);
    return res.status(201).json({
      massege: SYS_MASSEGE.user.created,
      success: true,
      data: { createdUser },
    });
  },
);

router.post(
  "/login",
  fileUpload().none(),
  isValid(loginSchema),
  async (req, res, next) => {
    const { accesToken, refreshToken } = await login(req.body);
    // send response
    return res.status(200).json({
      massege: "login successfully",
      success: true,
      data: { accesToken, refreshToken },
    });
  },
);

router.get("/refresh-token", async (req, res, next) => {
  // get new refresh token
  // req >> headres
  const { authorization } = req.headers; // refresh token
  // check token validation
  const { accesToken, refreshToken } = await refreshTokenService(authorization);

  return res.status(200).json({
    massege: "token redfreshed successfully",
    success: true,
    data: { accesToken, refreshToken },
  });
});

router.patch("/verify-account", async (req, res, next) => {
  await verifyAccount(req.body);
  res
    .status(200)
    .json({ massege: "email verifed successfully", success: true });
});

router.post("/send-otp", async (req, res, nest) => {
  await sendOtp(req.body);
  res.status(200).json({ massege: "otp send successfully", success: true });
});

router.patch(
  "/logout-from-all-devices",
  isAuthentcated,
  async (req, res, next) => {
    await logoutFromAllDevices(req.user);
    return res
      .status(200)
      .json({ massege: "logout from all devices", success: true });
  },
);

router.post("/logout", isAuthentcated, async (req, res, next) => {
  await logout(req.payload, req.user);
  return res
    .status(200)
    .json({ massege: "logout successfully", success: true });
});

router.post("/login-with-google", async (req, res, next) => {
  const { idToken } = req.body;
  const { accesToken, refreshToken } = await loginWithGoogle(idToken);
  return res.status(200).json({
    massege: "login successfully",
    success: true,
    data: { accesToken, refreshToken },
  });
});

router.post("/forget-password", async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Step 3: Reset Password
  if (email && otp && newPassword) {
    await authService.resetPassword({ email, newPassword });
    return res.status(200).json({ message: "password reset successfully" });
  }

  // Step 2: Verify OTP
  if (email && otp) {
    await { email, otp };
    return res.status(200).json({ message: "otp verified successfully" });
  }

  // Step 1: Send OTP
  if (email) {
    await sendOtp({ email });
    return res.status(200).json({ message: "otp sent to your email" });
  }

  return res.status(400).json({ message: "email is required" });
});

import {
  confirmLogin,
  enableTwoFactor,
  updatePassword,
  verifyAndEnableTwoFactor,
} from "./auth.service.js";

router.post(
  "/login",
  fileUpload().none(),
  isValid(loginSchema),
  async (req, res, next) => {
    const result = await login(req.body);

    if (result.requiresTwoFactor) {
      return res.status(200).json({
        massege: "verification code sent to your email",
        success: true,
        data: { requiresTwoFactor: true },
      });
    }

    const { accesToken, refreshToken } = result;
    return res.status(200).json({
      massege: "login successfully",
      success: true,
      data: { accesToken, refreshToken },
    });
  },
);

router.post("/login/confirm", async (req, res, next) => {
  const { accesToken, refreshToken } = await confirmLogin(req.body);
  return res.status(200).json({
    massege: "login successfully",
    success: true,
    data: { accesToken, refreshToken },
  });
});

router.post("/two-factor/enable", isAuthentcated, async (req, res, next) => {
  await enableTwoFactor(req.user);
  return res.status(200).json({
    massege: "otp sent to your email",
    success: true,
  });
});

router.patch("/two-factor/verify", isAuthentcated, async (req, res, next) => {
  await verifyAndEnableTwoFactor(req.user, req.body);
  return res.status(200).json({
    massege: "2-step verification enabled successfully",
    success: true,
  });
});

router.patch("/update-password", isAuthentcated, async (req, res, next) => {
  await updatePassword(req.user, req.body);
  return res.status(200).json({
    massege: "password updated successfully",
    success: true,
  });
});

// forget-password - استبدل الـ endpoint الموجود بالتلاتة دول
router.post("/forget-password", async (req, res, next) => {
  await forgetPassword(req.body);
  return res
    .status(200)
    .json({ massege: "otp sent to your email", success: true });
});

router.post("/forget-password/verify-otp", async (req, res, next) => {
  await verifyOtp(req.body);
  return res
    .status(200)
    .json({ massege: "otp verified successfully", success: true });
});

router.patch("/forget-password/reset", async (req, res, next) => {
  await resetPassword(req.body);
  return res
    .status(200)
    .json({ massege: "password reset successfully", success: true });
});

export default router;
