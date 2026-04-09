import { Router } from "express";
import {
  getAllMasseges,
  getSpeceficMassege,
  sendMassege,
} from "./massege.service.js";
import { SYS_MASSEGE } from "../../common/constant/massege.constant.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { isAuthentcated } from "../../middlewares/authentcation.middleware.js";
import { rateLimit } from "express-rate-limit";
const router = Router();
const limit = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  limit: 40,
  handler: (req, res, next) => {
    throw new Error("too many attemps", { cause: 429 });
  },
  legacyHeaders: false,
});
router.use(limit);
// send massage | create
router.post(
  "/:reciverId/anonymous",
  fileUpload().array("attatchments", 2),
  async (req, res, next) => {
    const { content } = req.body;
    const { reciverId } = req.params;
    const files = req.files;
    const createdMassege = await sendMassege(content, reciverId, files);
    return res.status(201).json({
      massege: SYS_MASSEGE.massege.created,
      success: true,
      createdMassege,
    });
  },
);

router.post(
  "/:reciverId/public",
  isAuthentcated,
  fileUpload().array("attatchments", 2),
  async (req, res, next) => {
    const { content } = req.body;
    const { reciverId } = req.params;
    const files = req.files;
    const createdMassege = await sendMassege(
      content,
      reciverId,
      files,
      req.user._id,
    );
    return res.status(201).json({
      massege: SYS_MASSEGE.massege.created,
      success: true,
      createdMassege,
    });
  },
);

router.get("/:id", isAuthentcated, async (req, res, next) => {
  const { id } = req.params;
  const massage = await getSpeceficMassege(id, req.user._id);
  return res.status(200).json({
    massege: "masseges",
    success: true,
    massage,
  });
});

router.get("/", isAuthentcated, async (req, res, next) => {
  const massages = await getAllMasseges(req.user._id);
  return res.status(200).json({
    massege: "masseges",
    success: true,
    massages,
  });
});

/// user-id
// get specific massege
// get all massege

export default router;
