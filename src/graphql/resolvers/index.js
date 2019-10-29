import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLUpload } from "graphql-upload";

import adminResolver from "./admin";
import postResolver from "./posts";
import employeeResolver from "./employee";

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
    admin_login: adminResolver.admin_login,
    admin_profile: adminResolver.admin_profile,
    employee_login: employeeResolver.employee_login,
    employee_profile: employeeResolver.employee_profile
  },
  // Exporting all Mutations
  Mutation: {
    create_admin: adminResolver.create_admin,
    create_employee: adminResolver.create_employee,
    edit_admin_profile: adminResolver.edit_admin_profile,
    update_employee_profile: employeeResolver.update_employee_profile,
    employee_change_password: employeeResolver.employee_change_password,
    image: postResolver.image
  }
};
