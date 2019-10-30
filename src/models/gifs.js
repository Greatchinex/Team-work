import mongoose, { Schema } from "mongoose";

const gifSchema = new Schema(
  {
    gif: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    flagged_as_inappropriate: {
      type: Boolean,
      default: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Employee"
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Gif", gifSchema);
