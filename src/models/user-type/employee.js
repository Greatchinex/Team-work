import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    f_name: {
      type: String,
      required: true
    },
    l_name: {
      type: String,
      required: true
    },
    phone_number: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    employee_id: {
      type: String,
      unique: true,
      required: true
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    gifs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Gif"
      }
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    user_type: {
      type: String
    },
    avatar: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
