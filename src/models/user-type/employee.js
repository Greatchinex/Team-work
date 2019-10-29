import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    f_name: {
      type: String
    },
    l_name: {
      type: String
    },
    phone_number: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    employee_id: {
      type: String,
      unique: true,
      required: true
    },
    department: {
      type: String
    },
    address: {
      type: String
    },
    job_title: {
      type: String
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
