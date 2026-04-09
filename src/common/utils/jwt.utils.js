import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function signToken(payload, secret, options) {
  payload.jti = crypto.randomBytes(10).toString("hex");
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

export function generateTokens(payload) {
  const accesToken = signToken(payload, "fkdjfdjvkvsdkjvnv", {
    expiresIn: 60 * 200,
  });

  const refreshToken = signToken(payload, "fjdsgiuegegiesg", {
    expiresIn: "1y",
  });
  return { accesToken, refreshToken };
}
