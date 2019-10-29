import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLUpload } from "graphql-upload";

import postResolver from "./posts";

export default {
  Date: GraphQLDateTime,
  Upload: GraphQLUpload,
  Query: {
    you: postResolver.you
  },
  Mutation: {
    image: postResolver.image
  }
};
