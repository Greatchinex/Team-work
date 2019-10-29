import { ApolloError, UserInputError } from "apollo-server-express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { combineResolvers } from "graphql-resolvers";

import Admin from "../../models/user-type/admin";
import Employee from "../../models/user-type/employee";
import Post from "../../models/posts";
import Gif from "../../models/gifs";
import Comment from "../../models/comments";

dotenv.config();

export default {
  create_admin: async (
    _,
    { f_name, l_name, email, phone_number, password }
  ) => {
    try {
      // Check if phone number is in DB
      const adminPhone = await Admin.findOne({
        phone_number
      });

      // Check if Email is in DB
      const adminEmail = await Admin.findOne({
        email
      });

      // If phoneNumber or Email is in DB
      if (adminEmail) {
        throw new UserInputError("User with email already exist");
      } else if (adminPhone) {
        throw new UserInputError("User with phone number already exist");
      }

      // Hash User Password Before saving user to DB
      const hashedPassword = await bcrypt.hash(password, 12);

      const newAdmin = new Admin({
        f_name,
        l_name,
        email,
        phone_number,
        password: hashedPassword
      });

      // Set the usertype to admin
      newAdmin.user_type === "admin";

      // Save user
      const savedAdmin = await newAdmin.save();

      // Response
      return {
        message: "Admin Created Successfully",
        value: true,
        user: savedAdmin
      };
    } catch (err) {
      throw err;
    }
  },
  admin_login: async (_, { email, password }) => {
    try {
      // Check for user details in DB
      const admin = await Admin.findOne({
        email
      });

      if (!admin) {
        throw new UserInputError("Incorrect Phone Number or Password");
      }

      // If User Exists then Compare Passwords
      const equalPassword = await bcrypt.compare(password, admin.password);
      if (!equalPassword) {
        throw new UserInputError("Incorrect Phone Number or Password");
      }

      // Create token for user
      const token = jwt.sign(
        {
          userId: admin._id,
          userType: admin.user_type
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d" // token will expire in 30 days
        }
      );

      // Response
      return {
        message: token,
        value: true,
        user: admin
      };
    } catch (err) {
      throw err;
    }
  }
};
