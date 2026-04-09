import {
  BadRequestException,
  compare,
  ConflictException,
  encryption,
  generateTokens,
  hash,
  NotFoundException,
  sendEmail,
  SYS_MASSEGE,
  SYS_ROLE,
  UnauthoreizedException,
  verifyToken,
} from "../../common/index.js";
import { userRepository, redisClinet } from "../../DB/index.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import { OAuth2Client } from "google-auth-library";

export const sendOtp = async (body) => {
  const { email } = body;
  // otp valid?
  const otpDoc = await redisClinet.exists(`${email}:otp`);
  if (otpDoc) throw new BadRequestException("your otp is still valid");
  // // create otp
  const otp = Math.floor(100000 + Math.random() * 900000);
  // // save otp into database
  // await otpRepository.create({
  //   email,
  //   otp,
  //   exppiresAt: Date.now() + 1 * 60 * 1000,
  // });

  await redisClinet.set(`${email}:otp`, otp, { EX: 1 * 60 });

  // send email
  await sendEmail({
    to: email,
    subject: "verify your account",
    html: `<p>your otp to verify your account is ${otp}</p>`,
  });
};

export const signup = async (body) => {
  // applly validation >> schema vs data (body - params)
  // prepare data
  const { email, phoneNumber } = body;
  const userExist = await checkUserExist({
    $or: [
      { email: { $eq: email, $exists: true, $ne: null } },
      { phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null } },
    ],
  });

  // fail case >> user exist
  if (userExist) throw new ConflictException(SYS_MASSEGE.user.alreadyExist);
  body.role = SYS_ROLE.user;

  // hash password
  body.password = await hash(body.password);
  // body.repassword = await hash(body.repassword);

  if (body.phoneNumber) {
    body.phoneNumber = encryption(phoneNumber);
  }
  // send otp
  await sendOtp({ email });

  await redisClinet.set(email, JSON.stringify(body), { EX: 1 * 24 * 60 * 60 });
  // create user in database
  // return await createUser(body);
};

// export const login = async (body) => {
//   // get data from request
//   const { email, password } = body;

  // check user exist
  // const userExist = await checkUserExist({
//     email: { $eq: email, $exists: true, $ne: null },
//   });

//   // check password
//   const match = await compare(password, userExist?.password || "fd");

//   // fail case >> user not exist
//   if (!userExist) throw new BadRequestException("invalid credentials");

//   if (!match) throw new BadRequestException("invalid credentials");

//   // const userData = JSON.parse(JSON.stringify(userExist)); // >> deep copy
//   // generate token

//   const { accesToken, refreshToken } = generateTokens({
//     sub: userExist._id,
//     role: userExist.role,
//   });
//   userExist.password = undefined;
//   await redisClinet.set(`refreshToken:${userExist._id}`, refreshToken);
//   return { accesToken, refreshToken };
//   // delete userData.password;
// };

export const verifyAccount = async (body) => {
  const { otp, email } = body;

  const otpDoc = await redisClinet.get(`${email}:otp`);
  if (!otpDoc) throw new BadRequestException("expired otp!");
  if (otp != otpDoc) {
    // otpDoc.attempts += 1;
    // if (otpDoc.attempts > 3) {
    //   await otpRepository.deleteOne({ _id: otpDoc._id });
    //   throw new BadRequestException("too many tries");
    // }
    // await otpDoc.save();
    throw new BadRequestException("invalid otp!");
  }

  // update user verify
  // await userRepository.update({ email }, { isEmailverified: true });
  let data = await redisClinet.get(email);

  await userRepository.create(JSON.parse(data));
  await redisClinet.del(email);
  await redisClinet.del(`${email}:otp`);
  return true;
};

export const logoutFromAllDevices = async (user) => {
  await userRepository.update(
    { _id: user._id },
    { credantialUpdatedAt: Date.now() },
  );
  return true;
};

export const logout = async (tokenPayload) => {
  // await tokenRepository.create({
  //   token: tokenPayload.jti,
  //   userId: user._id,
  //   expiresAt: tokenPayload.exp * 1000,
  // });
  await redisClinet.set(`bl_${tokenPayload.jti}`, tokenPayload.jti, {
    EX: Math.floor(
      (new Date(tokenPayload.exp * 1000).getTime() - Date.now()) / 1000,
    ),
  });
};

async function googleVerifyToken(idToken) {
  const client = new OAuth2Client("clientId");
  const ticket = await client.verifyIdToken({ idToken });
  ticket.getPayload();
  return ticket;
}

export const loginWithGoogle = async (idToken) => {
  // verify token with google
  const payload = await googleVerifyToken(idToken);

  if (payload.email_verified == false) {
    throw new BadRequestException("refused email from google");
  }

  // check user exist
  const user = await userRepository.getOne({ email: payload.email });

  // new user >> create user
  if (!user) {
    const createdUser = await userRepository.create({
      email: payload.email,
      profilePic: payload.profilePicture,
      userName: payload.name,
      isEmailverified: true,
      provider: "google",
    });

    // create tokens >> {access token , refresh token}
    return generateTokens({
      sub: createUser._id,
      role: createUser.role,
      provider: createUser.provider,
    });
  }

  // create tokens >> {access token , refresh token}
  return generateTokens({
    sub: user._id,
    role: user.role,
    provider: user.provider,
  });
};

export const refreshTokenService = async (authorization) => {
  // check token validation
  const payload = verifyToken(authorization, "fjdsgiuegegiesg"); // valid / expired
  console.log({ "payload from refresh": payload });

  const cashedRefreshToken = await redisClinet.get(
    `refreshToken:${payload.sub}`,
  );
  if (cashedRefreshToken != authorization) {
    await logoutFromAllDevices({ _id: payload.sub });
    await redisClinet.del(`refreshToken:${payload.sub}`);
    throw new UnauthoreizedException("you are not authorized");
  }

  delete payload.iat;
  delete payload.exp;

  const { accesToken, refreshToken } = generateTokens(payload);
  await redisClinet.set(`refreshToken:${payload.sub}`, refreshToken);

  return { accesToken, refreshToken };
};

export const forgetPassword = async (body) => {
  const { email } = body;

  const user = await userRepository.getOne({ email });

  if (!user) throw new NotFoundException(SYS_MASSEGE.user.notFound);
  await sendOtp({ email });

  return user;
};

export const resetPassword = async (body) => {
  const { email, newPassword } = body;

  const isVerified = await redisClinet.exists(`${email}:verified`);
  if (!isVerified)
    throw new BadRequestException("please verify your otp first");

  const user = await userRepository.findOne({ email });
  if (!user) throw new NotFoundException("no account found with this email");

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  await user.save();

  await redisClinet.del(`${email}:verified`);
};

export const verifyOtp = async (body) => {
  const { email, otp } = body;

  const storedOtp = await redisClient.get(`${email}:otp`);

  if (!storedOtp) throw new BadRequestException("otp expired or not found");

  if (storedOtp !== otp.toString())
    throw new BadRequestException("invalid otp");

  await redisClinet.del(`${email}:otp`);
  await redisClinet.set(`${email}:verified`, 1, { EX: 5 * 60 });
};


const MAX_FAILED_ATTEMPTS = 5;
const BAN_DURATION_MINUTES = 5;

// في login - استبدل الـ function الموجودة بيها
export const login = async (body) => {
  const { email, password } = body;

  const userExist = await checkUserExist({
    email: { $eq: email, $exists: true, $ne: null },
  });

  if (!userExist) throw new BadRequestException("invalid credentials");

  const bannedUntil = userExist.bannedUntil;
  if (bannedUntil && new Date(bannedUntil) > new Date()) {
    const remainingMs = new Date(bannedUntil) - new Date();
    const remainingMin = Math.ceil(remainingMs / 1000 / 60);
    throw new BadRequestException(
      `account is temporarily banned, try again in ${remainingMin} minute(s)`
    );
  }

  const match = await compare(password, userExist?.password || "fd");

  if (!match) {
    const failedAttempts = (userExist.failedLoginAttempts || 0) + 1;

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      await userRepository.update(
        { _id: userExist._id },
        {
          failedLoginAttempts: 0,
          bannedUntil: new Date(Date.now() + BAN_DURATION_MINUTES * 60 * 1000),
        }
      );
      throw new BadRequestException(
        `account has been temporarily banned for ${BAN_DURATION_MINUTES} minutes`
      );
    }

    await userRepository.update(
      { _id: userExist._id },
      { failedLoginAttempts: failedAttempts }
    );

    throw new BadRequestException("invalid credentials");
  }

  await userRepository.update(
    { _id: userExist._id },
    { failedLoginAttempts: 0, bannedUntil: null }
  );

  if (userExist.isTwoFactorEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redisClinet.set(`${email}:2fa_otp`, otp, { EX: 5 * 60 });
    await sendEmail({
      to: email,
      subject: "login verification code",
      html: `<p>your login verification code is ${otp}</p>`,
    });
    return { requiresTwoFactor: true };
  }

  const { accesToken, refreshToken } = generateTokens({
    sub: userExist._id,
    role: userExist.role,
  });

  userExist.password = undefined;
  await redisClinet.set(`refreshToken:${userExist._id}`, refreshToken);
  return { accesToken, refreshToken };
};

// functions جديدة - ضيفهم في الآخر

export const confirmLogin = async (body) => {
  const { email, otp } = body;

  const storedOtp = await redisClinet.get(`${email}:2fa_otp`);
  if (!storedOtp) throw new BadRequestException("otp expired or not found");
  if (storedOtp !== otp.toString()) throw new BadRequestException("invalid otp");

  const userExist = await checkUserExist({
    email: { $eq: email, $exists: true, $ne: null },
  });
  if (!userExist) throw new BadRequestException("invalid credentials");

  await redisClinet.del(`${email}:2fa_otp`);

  const { accesToken, refreshToken } = generateTokens({
    sub: userExist._id,
    role: userExist.role,
  });

  await redisClinet.set(`refreshToken:${userExist._id}`, refreshToken);
  return { accesToken, refreshToken };
};

export const enableTwoFactor = async (user) => {
  const otpDoc = await redisClinet.exists(`${user.email}:2fa_setup_otp`);
  if (otpDoc) throw new BadRequestException("your otp is still valid");

  const otp = Math.floor(100000 + Math.random() * 900000);
  await redisClinet.set(`${user.email}:2fa_setup_otp`, otp, { EX: 5 * 60 });
  await sendEmail({
    to: user.email,
    subject: "enable 2-step verification",
    html: `<p>your otp to enable 2-step verification is ${otp}</p>`,
  });
};

export const verifyAndEnableTwoFactor = async (user, body) => {
  const { otp } = body;

  const storedOtp = await redisClinet.get(`${user.email}:2fa_setup_otp`);
  if (!storedOtp) throw new BadRequestException("otp expired or not found");
  if (storedOtp !== otp.toString()) throw new BadRequestException("invalid otp");

  await userRepository.update({ _id: user._id }, { isTwoFactorEnabled: true });
  await redisClinet.del(`${user.email}:2fa_setup_otp`);
};

export const updatePassword = async (user, body) => {
  const { currentPassword, newPassword } = body;

  const userExist = await userRepository.getOne({ _id: user._id });
  if (!userExist) throw new NotFoundException(SYS_MASSEGE.user.notFound);

  const match = await compare(currentPassword, userExist.password);
  if (!match) throw new BadRequestException("current password is incorrect");

  const hashed = await hash(newPassword);
  await userRepository.update(
    { _id: user._id },
    { password: hashed, credantialUpdatedAt: Date.now() }
  );
};