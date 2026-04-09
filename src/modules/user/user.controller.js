import { Router } from "express";
import { decryption } from "../../common/index.js";
import { isAuthentcated } from "../../middlewares/authentcation.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { fileValidation } from "../../middlewares/file-validation.middleware.js";
import { uploadCoverPicture, uploadProfilePicture } from "./user.service.js";

const router = Router();

// get profile >> url /user/id , method = get
// token
router.get("/", isAuthentcated, async (req, res, next) => {
  // get data from req
  const { user } = req;

  // - decryption > phoneNumber
  user.phoneNumber = decryption(user?.phoneNumber || "0284024");

  // send profile (response)
  user.password = undefined;
  user.visitCount +=1

  return res
    .status(200)
    .json({ massege: "done", success: true, data: { user } });
});

router.patch(
  "/upload-profile-picture",
  isAuthentcated,
  fileUpload(["image/jpeg"]).single("pp"),
  fileValidation,
  async (req, res, next) => {
    const updatedUser = await uploadProfilePicture(req.user, req.file);
    return res.json({
      massege: "uploded",
      success: true,
      data: { updatedUser },
    });
  },
);



router.patch(
  "/upload-cover-picture",
  isAuthentcated,
  fileUpload().array("cover"),
  fileValidation,
  async (req, res, next) => {
    const updatedUser = await uploadCoverPicture(req.user, req.file);
    return res.json({
      massege: "cover picture uploded",
      success: true,
      data: { updatedUser },
    });
  },
);

export default router;
