import { ApolloError, UserInputError } from "apollo-server-express";
import dotenv from "dotenv";

import { processUpload } from "../../services/fileUploads";

dotenv.config();

export default {
  image: async (_, args) => {
    try {
      let uploadData = await processUpload(args.file);

      console.log(uploadData.path);

      return {
        message: "Hope it works",
        value: true
      };
    } catch (err) {
      throw err;
    }
  }
};
