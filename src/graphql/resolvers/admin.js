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
      newAdmin.user_type = "admin";

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
          throw new ApolloError("Employee with Id already exist");
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
        newEmploy.user_type = "employee";

        // Save employee
        const savedEmploy = await newEmploy.save();

        // Increase the number of employees
        await Admin.findByIdAndUpdate(
          Id,
          {
            $inc: { no_of_employees: +1 },
            $push: { employees: savedEmploy }
          },
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
  }),
  // Resolver for admin to view posts flagged as inappropriate
  view_flagged_posts: combineResolvers(
    isAdmin,
    async (_, { cursor, limit }) => {
      try {
        let posts;
        if (cursor) {
          posts = await Post.find({
            flagged_as_inappropriate: true,
            createdAt: { $lt: cursor }
          })
            .limit(limit + 1)
            .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

          // Check if the list of posts has a next page in the query
          const hasNextPage = posts.length > limit;
          const edges = hasNextPage ? posts.slice(0, -1) : posts;

          // Response
          return {
            edges,
            pageInfo: {
              hasNextPage,
              endCursor: edges[edges.length - 1].createdAt
            }
          };
        } else if (!cursor) {
          posts = await Post.find({
            flagged_as_inappropriate: true
          })
            .limit(limit + 1)
            .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

          // Check if the list of posts has a next page in the query
          const hasNextPage = posts.length > limit;
          const edges = hasNextPage ? posts.slice(0, -1) : posts;

          // Response
          return {
            edges,
            pageInfo: {
              hasNextPage,
              endCursor: edges[edges.length - 1].createdAt
            }
          };
        }
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver for admin to view gifs flagged as inappropriate
  view_flagged_gifs: combineResolvers(isAdmin, async (_, { cursor, limit }) => {
    try {
      let gifs;
      if (cursor) {
        gifs = await Gif.find({
          flagged_as_inappropriate: true,
          createdAt: { $lt: cursor }
        })
          .limit(limit + 1)
          .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

        // Check if the list of posts has a next page in the query
        const hasNextPage = gifs.length > limit;
        const edges = hasNextPage ? gifs.slice(0, -1) : gifs;

        // Response
        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1].createdAt
          }
        };
      } else if (!cursor) {
        gifs = await Gif.find({ flagged_as_inappropriate: true })
          .limit(limit + 1)
          .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

        // Check if the list of posts has a next page in the query
        const hasNextPage = gifs.length > limit;
        const edges = hasNextPage ? gifs.slice(0, -1) : gifs;

        // Response
        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1].createdAt
          }
        };
      }
    } catch (err) {
      throw err;
    }
  }),
  // Resolver for admin to view all employees
  view_employees: combineResolvers(isAdmin, async (_, { cursor, limit }) => {
    try {
      let employee;
      if (cursor) {
        employee = await Employee.find({
          createdAt: { $lt: cursor }
        })
          .limit(limit + 1)
          .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

        // Check if the list of posts has a next page in the query
        const hasNextPage = employee.length > limit;
        const edges = hasNextPage ? employee.slice(0, -1) : employee;

        // Response
        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1].createdAt
          }
        };
      } else if (!cursor) {
        employee = await Employee.find()
          .limit(limit + 1)
          .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

        // Check if the list of posts has a next page in the query
        const hasNextPage = employee.length > limit;
        const edges = hasNextPage ? employee.slice(0, -1) : employee;

        // Response
        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1].createdAt
          }
        };
      }
    } catch (err) {
      throw err;
    }
  }),
  // Resolver for admin to view comments flagged as inappropriate
  view_flagged_comments: combineResolvers(
    isAdmin,
    async (_, { cursor, limit }) => {
      try {
        let comments;
        if (cursor) {
          comments = await Comment.find({
            flagged_as_inappropriate: true,
            createdAt: { $lt: cursor }
          })
            .limit(limit + 1)
            .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

          // Check if the list of posts has a next page in the query
          const hasNextPage = comments.length > limit;
          const edges = hasNextPage ? comments.slice(0, -1) : comments;

          // Response
          return {
            edges,
            pageInfo: {
              hasNextPage,
              endCursor: edges[edges.length - 1].createdAt
            }
          };
        } else if (!cursor) {
          comments = await Comment.find({ flagged_as_inappropriate: true })
            .limit(limit + 1)
            .sort({ createdAt: -1 }); // -1: sort by descending order(from newest to oldest)

          // Check if the list of posts has a next page in the query
          const hasNextPage = comments.length > limit;
          const edges = hasNextPage ? comments.slice(0, -1) : comments;

          // Response
          return {
            edges,
            pageInfo: {
              hasNextPage,
              endCursor: edges[edges.length - 1].createdAt
            }
          };
        }
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver for admin to delete a flagged post(privete route: Only 4 admin)
  delete_flagged_post: combineResolvers(
    isAdmin,
    async (_, { postId }, { Id }) => {
      try {
        // Find post
        const postCheck = await Post.findById(postId);

        if (!postCheck) {
          throw new ApolloError("Post not found");
        }

        // Check if the post was flagged as inappropriate
        if (postCheck.flagged_as_inappropriate === false) {
          throw new ApolloError(
            "This post has not been flagged, You cannot delete it"
          );
        }

        // Delete post
        const deletedPost = await Post.findByIdAndRemove(postId);

        await Employee.findByIdAndUpdate(
          postCheck.creator,
          { $pull: { posts: deletedPost._id } },
          { new: true }
        );

        // Response
        return {
          message: "Post Deleted Successfully",
          value: true
        };
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver for admin to delete a flagged gif(privete route: Only 4 admin)
  delete_flagged_gif: combineResolvers(isAdmin, async (_, { gifId }) => {
    try {
      // Find gif
      const gifCheck = await Gif.findById(gifId);

      if (!gifCheck) {
        throw new ApolloError("Gif not found");
      }

      // Check if the gif was flagged as inappropriate
      if (gifCheck.flagged_as_inappropriate === false) {
        throw new ApolloError(
          "This Gif has not been flagged, You cannot delete it"
        );
      }

      // Delete Gif
      const deletedGif = await Gif.findByIdAndRemove(gifId);

      await Employee.findByIdAndUpdate(
        gifCheck.creator,
        { $pull: { gifs: deletedGif._id } },
        { new: true }
      );

      // Response
      return {
        message: "Gif Deleted Successfully",
        value: true
      };
    } catch (err) {
      throw err;
    }
  }),
  // Resolver for admin to delete a flagged comment(privete route: Only 4 admin)
  delete_flagged_comment: combineResolvers(
    isAdmin,
    async (_, { commentId }) => {
      try {
        // Find gif
        const commentCheck = await Comment.findById(commentId);

        if (!commentCheck) {
          throw new ApolloError("Comment not found");
        }

        // Check if the gif was flagged as inappropriate
        if (commentCheck.flagged_as_inappropriate === false) {
          throw new ApolloError(
            "This Comment has not been flagged, You cannot delete it"
          );
        }

        // Delete Gif
        const deletedComment = await Comment.findByIdAndRemove(commentId);

        await Employee.findByIdAndUpdate(
          commentCheck.creator,
          { $pull: { comments: deletedComment._id } },
          { new: true }
        );

        // Response
        return {
          message: "Comment Deleted Successfully",
          value: true
        };
      } catch (err) {
        throw err;
      }
    }
  )
};
