import { Router } from "express";
import {
  addComment,
  addCommentOnTweets,
  deleteComment,
  getTweetComments,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/tc/:tweetId").get(getTweetComments).post(addCommentOnTweets);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
