import { Router } from "express";
import {
  changeCurrentPassword,
  emptyWatchHistory,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/update-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-currentUser").get(verifyJWT, getCurrentUser);
router.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails);
router
  .route("/updateAvatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
router
  .route("/history")
  .get(verifyJWT, getWatchHistory)
  .post(verifyJWT, emptyWatchHistory);

export default router;
