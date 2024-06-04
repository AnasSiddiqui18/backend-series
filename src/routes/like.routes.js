import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getVideoLikes,
  getCommentLikes,
  getTweetLikes,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getTweetById } from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/videoLikes/:videoId").post(getVideoLikes);
router.route("/tweetLikes/:tweetId").post(getTweetLikes);
router.route("/commentLikes/:commentId").post(getCommentLikes);

export default router;
