import { NotFoundException } from "../../common/index.js";
import { userRepository } from "../../DB/index.js";
import fs from "node:fs";
export const checkUserExist = async (filter) => {
  return await userRepository.getOne(filter); // {} || null
};

export const createUser = async (userData) => {
  return await userRepository.create(userData);
};

export const getProfile = async (filter) => {
  return await userRepository.getOne(filter);
};

export const uploadProfilePicture = async (user, file) => {
  const updatedUser = await userRepository.update(
    { _id: user._id },
    { profilePic: file.path },
  );
  if (!updatedUser) throw new NotFoundException("user not found");
  // delete old photo
  if (fs.existsSync(user.profilePic)) fs.unlinkSync(user.profilePic);
  return updatedUser;
};




export const uploadCoverPicture = async (user, file) => {
  const updatedUser = await userRepository.update(
    { _id: user._id },
    { coverPic: file.path },
  );
  if (!updatedUser) throw new NotFoundException("user not found");
  // delete old photo
  if (fs.existsSync(user.coverPic)) fs.unlinkSync(user.coverPic);
  return updatedUser;
};