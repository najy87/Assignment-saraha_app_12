import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../common/index.js";
import fs from "node:fs";

// Middleware to validate file type by magic number (file signatures)
export const fileValidation = async (req, res, next) => {
  // get the file path
  const filePath = req.file?.path;
  // read the file and return buffer
  const buffer = fs.readFileSync(filePath);
  // get the file type
  const type = await fileTypeFromBuffer(buffer);
  // validate
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!type || !allowedTypes.includes(type.mime)) {
    // delete file
    fs.unlinkSync(filePath);
    throw new BadRequestException("invalid file type");
  }
//   req.file = file;
  return next();
};





