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
import { isEmployee } from "../../services/authorization";
import { processUpload } from "../../services/fileUploads";

dotenv.config();

export default {
  employee_login: combineResolvers(
    isEmployee,
    async (_, { employee_id, password }) => {
      try {
        // Check for user
        const findEmploy = await Employee.findOne({ employee_id });

        if (!findEmploy) {
          throw new UserInputError("Incorrect employee number or password");
        }

        // If User Exists then Compare Passwords
        const equalPassword = await bcrypt.compare(
          password,
          findEmploy.password
        );
        if (!equalPassword) {
          throw new UserInputError("Incorrect employee number or password");
        }

        // Create token for user
        const token = jwt.sign(
          {
            userId: findEmploy._id,
            userType: findEmploy.user_type
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
          user_1: findEmploy
        };
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver for employee to edit profile (Private route: Only 4 employees)
  update_employee_profile: combineResolvers(
    isEmployee,
    async (_, args, { Id }) => {
      try {
        let employUpdate;
        // Check if there is a file(Profile picture)
        if (args.file) {
          let uploadData = await processUpload(args.file),
            // Update the employee account along with the avatar
            employUpdate = await Employee.findByIdAndUpdate(
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
          // Update employee acount
          employUpdate = await Employee.findByIdAndUpdate(Id, args, {
            new: true
          });
        }

        //Response
        return {
          message: "Account Updated Successfully",
          value: true,
          user_1: employUpdate
        };
      } catch (err) {
        throw err;
      }
    }
  ),
  // Load employee profile (Private route only 4 employee)
  employee_profile: combineResolvers(isEmployee, async (_, args) => {
    try {
      // Find the loggedin user
      const employProfile = await Employee.findById(args.employeeId);

      if (!employProfile) {
        throw new ApolloError("User Does Not Exist");
      }

      return employProfile;
    } catch (err) {
      throw err;
    }
  }),
  // Resolver for employee to change password after admin has created his account
  employee_change_password: combineResolvers(
    isEmployee,
    async (
      _,
      { employeeId, old_password, new_password, confirm_password },
      { Id }
    ) => {
      try {
        // verify user
        const employFind = await Employee.findById(employeeId);

        if (!employFind) {
          throw new ApolloError("User does not exist");
        }

        // Check if old password is correct
        if (employFind.password !== old_password) {
          throw new UserInputError("Make sure your old password is correct");
        }

        // Check if the new passwords match
        if (new_password !== confirm_password) {
          throw new UserInputError("Please make sure the new passwords match");
        }

        // Hash User Password Before saving user to DB
        const hashedPassword = await bcrypt.hash(new_password, 12);

        // Update acoount with new password
        await Employee.findByIdAndUpdate(
          Id,
          { $set: { password: hashedPassword } },
          { new: true }
        );

        // Response
        return {
          message: "Password reset successful",
          value: true
        };
      } catch (err) {
        throw err;
      }
    }
  )
};
