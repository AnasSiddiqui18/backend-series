import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  //   to toggle the subscription we have to first check that if the channel has been subscribed or not to find it we will query the database to find that is the channel or the current user is in the subscriber or in the channel list or not

  // if the current user or the channel is not in the subscription or in channel list so we will create a new document which contain the channel in the channel property and the current user in the subscriber property

  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(200, "channel id is missing");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  console.log("subscription", subscription);

  // If the subscription is found so we will delete the subscription and if the subscription not found so we will create a new document in the database.

  if (!subscription) {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
  } else {
    await Subscription.findByIdAndDelete(subscription._id);
  }

  const subscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  let isSubscribed;

  if (subscribed) {
    isSubscribed = true;
  } else {
    isSubscribed = false;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed },
        isSubscribed ? "Subscribed Successfully" : "Unsubscribed Successfully"
      )
    );
});

// const toggleSubscription = asyncHandler(async (req, res) => {
//   console.log("toggle subscription function is working");

//   const { channelId } = req.params;

//   console.log("channel id", channelId);

//   if (!channelId) {
//     throw new ApiError(400, "channel Id is missing");
//   }

//   const subscription = await Subscription.findOne({
//     channel: channelId,
//     subscriber: req.user._id,
//   });

//   console.log("subscription", subscription);

//   if (!subscription) {
//     await Subscription.create({
//       channel: channelId,
//       subscriber: req.user._id,
//     });
//   } else {
//     await Subscription.findByIdAndDelete(subscription._id);
//   }
//   const subscribed = await Subscription.findOne({
//     channel: channelId,
//     subscriber: req.user._id,
//   });

//   let isSubscribed;

//   if (!subscribed) {
//     isSubscribed = false;
//   } else {
//     isSubscribed = true;
//   }
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         isSubscribed,
//       },
//       "success"
//     )
//   );
// });

const getChannelSubscriber = asyncHandler(async (req, res) => {
  //   we are storing the user id of the subscriber in the subscriber property and the channel who is being subscribed we will put the channel id inside the channel property

  // the goal here is to get the subscriber of a particular channel we will get a channel id. when the match method will filter so it will found all the document which contain the id passed by the user in the chanel property of the document for example if $match method filter 5 documents so for each document the $lookup method will create a join between the user collection and the subscription and the subcriber property of the filtered document. and when we compare the subscriber property with the user id so the matched user will be the subscriber.

  const { channelId } = req.params;

  console.log("channel id", channelId);

  if (!channelId) {
    throw new ApiError(400, "channel id is required");
  }

  const channelSubscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(`${channelId}`) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscriber: {
          $first: "$subscriber",
        },
        createdAt: 1,
      },
    },
  ]);

  console.log("channel subscribers", channelSubscribers);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscribers, "channel's subscribers fetched")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  //  our goal is to get the channels subscribed by this channel

  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channel Id is missing");
  }

  const subscribedChannels = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(`${channelId}`) } },

    // this match method is filtering the id passed by the user got from the req.params in the subscription subscriber property
    // for example if the filtered document is 5 so it also contains a channel property which contain the channel id of the channels this particular channel has subscribed we will look for the same id in the user collecction.

    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelsSubcribedTo",

        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    {
      $project: {
        channelsSubcribedTo: {
          $first: "$channelsSubcribedTo",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannels, "Subscribed channels fetched")
    );
});

// const getSubscribedChannels = asyncHandler(async (req, res) => {
//   // the goal is to find out the channel subscribed by the particular channel.
//   // we will receive the channel id in the params
//   // match the id in the subscription documents in the subscriber property that if the id match with the particular channel id
//   // and then add aggregation pipeline make a connection btw the user document because this channel is also a user and when any channel subscribe other channel so it's id will get store in the subscriber property of the document

//   const { channelId } = req.params;

//   if (!channelId) {
//     throw new ApiError(400, "Channel id is required");
//   }

//   const subscribedChannels = Subscription.aggregate([
//     { $match: { subscriber: new mongoose.Types.ObjectId(`${channelId}`) } },

//     {
//       $lookup: {
//         from: "users",
//         localField: "subscriber",
//         foreignField: "_id",
//         as: "channelSubscribedTo",

//         pipeline: [
//           {
//             $project: {
//               username: 1,
//               email: 1,
//               fullName: 1,
//               avatar: 1,
//             },
//           },

//           {
//             $addFields: {
//               channelSubscribedTo: {
//                 $first: "$channelSubscribedTo",
//               },
//             },
//           },
//         ],
//       },

//       $project: {
//         channelSubscribedTo: 1,
//         $createdAt: 1,
//       },
//     },
//   ]);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { subscribedChannels },
//         "channels subscribed to fetched successfully"
//       )
//     );
// });

// const getSubscribedChannels = asyncHandler(async (req, res) => {
//   const { channelId } = req.params;

//   if (!channelId) {
//     throw new ApiError(400, "channel id is required");
//   }

//   const subscribedChannels = await Subscription.aggregate([
//     {
//       $match: { subscriber: new mongoose.Types.ObjectId(`${channelId}`) }, // 768001
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "channel", // when the user subscribe a channel so we are storing the id of the channel in the channel property
//         foreignField: "_id",
//         as: "channel",
//         pipeline: [
//           {
//             $project: {
//               userName: 1,
//               fullName: 1,
//               avatar: 1,
//             },
//           },
//         ],
//       },
//     },
//     {
//       $project: {
//         channel: {
//           $first: "$channel",
//         },

//         createdAt: 1,
//       },
//     },
//   ]);

//   console.log("subscribedChannels", subscribedChannels);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, subscribedChannels, "success"));
// });

export { toggleSubscription, getChannelSubscriber, getSubscribedChannels };
