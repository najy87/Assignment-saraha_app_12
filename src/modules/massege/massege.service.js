import { NotFoundException, SYS_MASSEGE } from "../../common/index.js";
import { massageRepository } from "../../DB/models/massege/massege.repository.js";

export const sendMassege = async (
  content,
  reciverId,
  files,
  senderId = undefined,
) => {
  let paths = [];
  if (files) {
    paths = files.map((file) => {
      return file.path;
    });
  }
  const createdMassege = await massageRepository.create({
    content,
    reciver: reciverId,
    attatchments: paths,
    sender: senderId,
  });
  return createdMassege;
};

export const getSpeceficMassege = async (id, userid) => {
  const massege = await massageRepository.getOne(
    { _id: id, $or: [{ reciver: userid }, { sender: userid }] },
    {},
    { populate: [{ path: "reciver", select: "-password" }] },
  );
  if (!massege) throw new NotFoundException(SYS_MASSEGE.massege.notFound);
  return massege;
};

export const getAllMasseges = async (userid) => {
  const masseges = await massageRepository.getAll(
    { $or: [{ reciver: userid }, { sender: userid }] },
    {},
    { populate: [{ path: "reciver", select: "-password" }] },
  );
  if (masseges.length == 0)
    throw new NotFoundException("you dont have any massege");
  return masseges;
};
