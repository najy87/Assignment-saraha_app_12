import multer, { diskStorage } from "multer";
import fs from "node:fs";
import { BadRequestException } from "./error.utils.js";
export const fileUpload = (
  allowedType = ["image/png", "image/jpeg", "image/gif", "image/jpg"],
) => {
  return multer({
    fileFilter: (req, file, cb) => {
      // condition >> cb
      if (!allowedType.includes(file.mimetype)) {
        return cb(new BadRequestException("invalid file format"), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5000000 },
    storage: diskStorage({
      destination: (req, file, cb) => {
        // create folder
        const folder = req.user
          ? `uploads/${req.user._id}`
          : `uploads/${req.params.reciverId}/massege`;
        if (!fs.existsSync(folder)) {
          return fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
      }, // string || function
      filename: (req, file, cb) => {
        // console.log({ file }); // information about file
        cb(null, Date.now() + Math.random() + "__" + file.originalname);
      }, // function
    }),
  });
};
