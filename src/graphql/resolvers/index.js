import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLUpload } from "graphql-upload";

import adminResolver from "./admin";
import postResolver from "./posts";

import Admin from "../../models/user-type/admin";
import Employee from "../../models/user-type/employee";
import Post from "../../models/posts";
import Gif from "../../models/gifs";
import Comment from "../../models/comments";

export default {
  Date: GraphQLDateTime,
  Upload: GraphQLUpload,
  // Exporting all Queries
  Query: {
    admin_login: adminResolver.admin_login
  },
  // Exporting all Mutations
  Mutation: {
    create_admin: adminResolver.create_admin,
    image: postResolver.image
  }
};
