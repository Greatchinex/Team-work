import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    flagged_as_inappropriate: {
      type: Boolean,
      default: false
    },
    category: {
      type: String
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

export default mongoose.model("Post", postSchema);
