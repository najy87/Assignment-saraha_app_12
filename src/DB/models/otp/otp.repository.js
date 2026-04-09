import { DBRepositoty } from "../../db.repository.js";
import { OTP } from "./otp.model.js";

class OtpRepository extends DBRepositoty {
  constructor() {
    super(OTP);
  }
}

export const otpRepository = new OtpRepository();
