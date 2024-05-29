import { Types, model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Types.ObjectId, // one who is subscribing
      ref: "User",
    },

    channel: {
      type: Types.ObjectId, // one who get subscribed by subscriber
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = model("Subscription", subscriptionSchema);
