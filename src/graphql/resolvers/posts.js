import { ApolloError } from "apollo-server-express";
import dotenv from "dotenv";
import { combineResolvers } from "graphql-resolvers";

import Admin from "../../models/user-type/admin";
import Employee from "../../models/user-type/employee";
import Post from "../../models/posts";
import Gif from "../../models/gifs";
import Comment from "../../models/comments";
import { isAdmin } from "../../services/authorization";
import { isEmployee } from "../../services/authorization";
import { isAuthenticated } from "../../services/authorization";
import { processUpload } from "../../services/fileUploads";

dotenv.config();

export default {
  // Resolver to create a post
  create_post: combineResolvers(
    isEmployee,
    async (_, { title, content, file, category }, { Id }) => {
      try {
        // User should finish updating their profile
        const employCheck = await Employee.findById(Id);

        if (!employCheck) {
          throw new ApolloError("User not found");
        }

        if (
          !employCheck.f_name ||
          !employCheck.l_name ||
          !employCheck.email ||
          !employCheck.phone_number ||
          !employCheck.department ||
          !employCheck.address ||
          !employCheck.job_title
        ) {
          throw new ApolloError(
            "Please complete your profile update before you can create a post"
          );
        }

        let posts;
        let savedPost;
        // Check if a file was uploaded(Post image)
        if (file) {
          let uploadData = await processUpload(file);

          posts = new Post({
            title,
            content,
            category,
            creator: Id,
            image: uploadData.path
          });

          // Save post
          savedPost = await posts.save();

          // Update user profile with posts
          await Employee.findByIdAndUpdate(
            Id,
            { $push: { posts: savedPost }, $inc: { no_of_posts: +1 } },
            { new: true }
          );
        } else {
          posts = new Post({
            title,
            content,
            category,
            creator: Id
          });

          savedPost = await posts.save();

          // Update user profile with posts
          await Employee.findByIdAndUpdate(
            Id,
            { $push: { posts: savedPost }, $inc: { no_of_posts: +1 } },
            { new: true }
          );
        }

        // Response
        return savedPost;
      } catch (err) {
        throw err;
      }
    }
  ),
  // Resolver to edit a post
  edit_post: combineResolvers(isEmployee, async (_, args, { Id }) => {
    try {
      let updatedPost;
      // Check for file
      if (args.file) {
        let uploadData = await processUpload(args.file);

        updatedPost = await Employee.findByIdAndUpdate(
          Id,
          {
            $set: {
              args,
              image: uploadData.path
            }
          },
          { new: true }
        );
      } else {
        updatedPost = await Employee.findByIdAndUpdate(Id, args, { new: true });
      }

      // Response
      return updatedPost;
    } catch (err) {
      throw err;
    }
  }),
  // Resolver to view a single post
  post_with_id: combineResolvers(isAuthenticated, async (_, { postId }) => {
    try {
      // Check for post
      const postCheck = await Post.findById(postId);

      if (!postCheck) {
        throw new ApolloError("Post does not exists");
      }

      return postCheck;
    } catch (err) {
      throw err;
    }
  }),
  // Resolver to view post created by user
  view_personal_posts: combineResolvers(
    isEmployee,
    async (_, { cursor, limit }, { Id }) => {
      try {
        /* Cursor based pagination to limit the number of posts that comes as a
        response per page */
        let posts;
        if (cursor) {
          posts = await Post.find({
            creator: Id,
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
            creator: Id
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
  // Resolver to view all posts
  view_all_posts: combineResolvers(
    isAuthenticated,
    async (_, { cursor, limit }, { Id }) => {
      try {
        /* Cursor based pagination to limit the number of posts that comes as a
        response per page */
        let posts;
        if (cursor) {
          posts = await Post.find({
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
          posts = await Post.find()
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
  // Resolver to view posts by categories
  view_post_by_category: combineResolvers(
    isAuthenticated,
    async (_, { cursor, limit, category }, { Id }) => {
      try {
        /* Cursor based pagination to limit the number of posts that comes as a
        response per page */
        let posts;
        if (cursor) {
          posts = await Post.find({
            category,
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
          posts = await Post.find({ category })
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
  )
};
