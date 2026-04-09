import {
  BadRequestException,
  SYS_MASSEGE,
  verifyToken,
} from "../common/index.js";
import { NotFoundException } from "../common/index.js";
import { userRepository } from "../DB/index.js";
import { redisClinet } from "../DB/redis.connection.js";

export const isAuthentcated = async (req, res, next) => {
  const { authorization } = req.headers;

  const payload = verifyToken(authorization, "fkdjfdjvkvsdkjvnv"); // >> invalid signture
  console.log({ payload });

  const user = await userRepository.getOne({ _id: payload.sub }); // null | {}
  if (!user) throw new NotFoundException(SYS_MASSEGE.user.notFound);
  // console.log(user.visitCount);
  user.visitCount +=1
  await user.save()

  
  if (new Date(user.credantialUpdatedAt).getTime() > payload.iat * 1000) {
    throw new BadRequestException("invaild token");
  }
  const tokenExist = await redisClinet.get(`bl_${payload.jti}`);
  if (tokenExist) throw new BadRequestException("invalid token");


  // inject user data
  req.user = user;
  req.payload = payload;
  next();
};



// otpDoc.attempts += 1;
    // if (otpDoc.attempts > 3) {
    //   await otpRepository.deleteOne({ _id: otpDoc._id });
    //   throw new BadRequestException("too many tries");
    // }
    // await otpDoc.save();



