import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLUpload } from "graphql-upload";

import adminResolver from "./admin";
import postResolver from "./posts";
import employeeResolver from "./employee";
import gifResolver from "./gifs";

import Admin from "../../models/user-type/admin";
import Employee from "../../models/user-type/employee";
import Post from "../../models/posts";
import Gif from "../../models/gifs";
import Comment from "../../models/comments";

export default {
  Date: GraphQLDateTime,
  Upload: GraphQLUpload,
  // Resolving all Schema types with relationships to other Schema types
  Admin: {
    employees: (_, __) => Employee.find({ _id: _.employees })
  },
  Employee: {
    posts: (_, __) => Post.find({ _id: _.posts }),
    gifs: (_, __) => Gif.find({ _id: _.gifs })
  },
  Post: {
    creator: (_, __) => Employee.findById(_.creator)
  },
  Gif: {
    creator: (_, __) => Employee.findById(_.creator)
  },
  // Exporting all Queries
  Query: {
    admin_login: adminResolver.admin_login,
    admin_profile: adminResolver.admin_profile,
    employee_login: employeeResolver.employee_login,
    employee_profile: employeeResolver.employee_profile,
    post_with_id: postResolver.post_with_id,
    view_personal_posts: postResolver.view_personal_posts,
    view_all_posts: postResolver.view_all_posts,
    view_post_by_category: postResolver.view_post_by_category,
    gif_with_id: gifResolver.gif_with_id,
    view_personal_gifs: gifResolver.view_personal_gifs,
    view_all_gifs: gifResolver.view_all_gifs
  },
  // Exporting all Mutations
  Mutation: {
    create_admin: adminResolver.create_admin,
    create_employee: adminResolver.create_employee,
    edit_admin_profile: adminResolver.edit_admin_profile,
    update_employee_profile: employeeResolver.update_employee_profile,
    employee_change_password: employeeResolver.employee_change_password,
    create_post: postResolver.create_post,
    edit_post: postResolver.edit_post,
    create_gif: gifResolver.create_gif
  }
};
