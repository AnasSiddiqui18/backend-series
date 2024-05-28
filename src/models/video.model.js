import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    thumbnail: {
      type: String, // cloudinary url
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    isPublished: {
      type: Boolean,
      required: true,
      default: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    videoFile: {
      type: String, // cloudinary url
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = model("Video", videoSchema);
