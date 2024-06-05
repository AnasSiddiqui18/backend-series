import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const currentUser = req.user._id;

  console.log("current user", currentUser);

  const video = await Video.find({ owner: currentUser });

  const totalViews = video.reduce(
    (acc, currentView) => currentView.views + acc,
    0
  );

  const getChannelVideos = await Video.aggregate([
    {
      $match: {
        owner: currentUser,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",

        pipeline: [
          {
            $project: {
              subscriber: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
      },
    },

    {
      $project: {
        likes: 1,
        subscribersCount: 1,
      },
    },
  ]);

  console.log("get channel videos", getChannelVideos);

  const totalLikes = getChannelVideos.reduce((acc, currentValue) => {
    return currentValue.likes.length + acc;
  }, 0);

  res.status(200).json({
    totalSubscribers: getChannelVideos[0].subscribersCount,
    totalVideos: getChannelVideos?.length,
    totalLikes,
    totalViews,
    message: "Channel stats fetched successfully",
  });
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const currentUser = req.user._id;
  const channelVideos = await Video.find({ owner: currentUser });

  if (channelVideos?.length < 1) {
    throw new ApiError(400, "videos not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
