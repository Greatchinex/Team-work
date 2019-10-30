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
  // Create a new gif
  create_gif: combineResolvers(
    isEmployee,
    async (_, { file, title }, { Id }) => {
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
            "Please complete your profile update before you can create a gif"
          );
        }

        let uploadData = await processUpload(file);

        // Create gif
        const gif = new Gif({
          title,
          gif: uploadData.path,
          creator: Id
        });

        const savedGif = await gif.save();

        // Update the user profile with gif
        await Employee.findByIdAndUpdate(
          Id,
          { $push: { gifs: savedGif } },
          { new: true }
        );

        // Response
        return savedGif;
      } catch (err) {
        throw err;
      }
    }
  ),
  // View a particular Gif
  gif_with_id: combineResolvers(isAuthenticated, async (_, { gifId }) => {
    try {
      // Find gif
      const gifFind = await Gif.findById(gifId);

      if (!gifFind) {
        throw new ApolloError("Gif does not exist");
      }

      return gifFind;
    } catch (err) {
      throw err;
    }
  }),
  // View all personal created gifs
  view_personal_gifs: combineResolvers(
    isEmployee,
    async (_, { cursor, limit }, { Id }) => {
      try {
        let gifs;
        if (cursor) {
          gifs = await Gif.find({
            creator: Id,
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
          gifs = await Gif.find({
            creator: Id
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
        }
      } catch (err) {
        throw err;
      }
    }
  ),
  view_all_gifs: combineResolvers(
    isAuthenticated,
    async (_, { cursor, limit }) => {
      try {
        let gifs;
        if (cursor) {
          gifs = await Gif.find({
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
          gifs = await Gif.find()
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
    }
  )
};
