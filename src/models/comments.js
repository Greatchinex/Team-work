import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true
    },
    flagged_as_inappropriate: {
      type: Boolean,
      default: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Employee"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
