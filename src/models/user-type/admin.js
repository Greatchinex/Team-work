import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
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
  employees: [
    {
      type: Schema.Types.ObjectId,
      ref: "Employee"
    }
  ],
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
  no_of_employees: {
    type: Number,
    default: 0
  },
  user_type: {
    type: String
  },
  avatar: {
    type: String
  }
});

export default mongoose.model("Admin", adminSchema);
