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
import { isAdmin } from "../../services/authorization";
import { processUpload } from "../../services/fileUploads";

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
        throw new UserInputError("Incorrect email or Password");
      }

      // If User Exists then Compare Passwords
      const equalPassword = await bcrypt.compare(password, admin.password);
      if (!equalPassword) {
        throw new UserInputError("Incorrect email or Password");
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
  },
  // Resolver for admin to create employees on the platform
  create_employee: combineResolvers(
    isAdmin,
    async (_, { employee_id, password }, { Id }) => {
      try {
        // Check if employees is already created
        const employ = await Employee.findOne({ employee_id });

        if (employ) {
          throw new ApolloError("Employee already exist");
        }

        // The employeeId and password should be the same
        if (employee_id !== password) {
          throw new ApolloError(
            "Please make sure the password is the same as the employee number"
          );
        }

        // Hash User Password Before saving user to DB
        const hashedPassword = await bcrypt.hash(password, 12);

        // create the employee
        const newEmploy = new Employee({
          employee_id,
          password: hashedPassword
        });

        // Set the usertype to emloyee
        employ.user_type === "employee";

        // Save employee
        const savedEmploy = await newEmploy.save();

        // Increase the number of employees
        await Admin.findByIdAndUpdate(
          Id,
          { $inc: { no_of_employees: +1 } },
          { new: true }
        );

        // Response
        return {
          message: "Employee Created Successfully",
          value: true,
          user_1: savedEmploy
        };
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver for admin to edit profile (Private Route: Only for Admin)
  edit_admin_profile: combineResolvers(isAdmin, async (_, args, { Id }) => {
    try {
      let adminUpdate;
      // Check if the admin uploaded a file(Profile Picture)
      if (args.file) {
        let uploadData = await processUpload(args.file);

        // Update the admin account with the avatar
        adminUpdate = await Admin.findByIdAndUpdate(
          Id,
          {
            $set: {
              args,
              avatar: uploadData.path
            }
          },
          { new: true }
        );
      } else {
        // Update user account
        adminUpdate = await Admin.findByIdAndUpdate(Id, args, { new: true });
      }

      // Response
      return {
        message: "Account updated successfully",
        value: true,
        user: adminUpdate
      };
    } catch (err) {
      throw err;
    }
  }),
  // Resolver to load admin profile (Private route: Only for admin)
  admin_profile: combineResolvers(isAdmin, async (_, args) => {
    try {
      // Find the loggedin user
      const adminProfile = await Admin.findById(args.adminId);

      if (!adminProfile) {
        throw new ApolloError("User Does Not Exist");
      }

      return adminProfile;
    } catch (err) {
      throw err;
    }
  })
};
