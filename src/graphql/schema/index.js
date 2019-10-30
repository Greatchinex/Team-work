import { gql } from "apollo-server-express";

export default gql`
  scalar Date

  schema {
    query: Query
    mutation: Mutation
  }

  type Query {
    admin_login(email: String!, password: String!): Status
    employee_login(employee_id: String!, password: String!): Status
    admin_profile(adminId: ID!): Admin!
    employee_profile(employeeId: ID!): Employee!
    post_with_id(postId: ID!): Post!
    view_all_posts(cursor: String, limit: Int): PostConnection!
    view_personal_posts(cursor: String, limit: Int): PostConnection!
    view_post_by_category(
      category: String!
      cursor: String
      limit: Int
    ): PostConnection!
    gif_with_id(gifId: ID!): Gif!
    view_all_gifs(cursor: String, limit: Int): GifConnection!
    view_personal_gifs(cursor: String, limit: Int): GifConnection!
  }

  type Mutation {
    create_admin(
      f_name: String!
      l_name: String!
      email: String!
      phone_number: String!
      password: String!
    ): Status
    create_employee(employee_id: String!, password: String!): Status
    edit_admin_profile(
      f_name: String
      l_name: String
      email: String
      phone_number: String
      password: String
      file: Upload
    ): Status
    employee_change_password(
      employeeId: ID!
      old_password: String!
      new_password: String!
      confirm_password: String!
    ): Status
    update_employee_profile(
      f_name: String
      l_name: String
      email: String
      phone_number: String
      department: String
      address: String
      job_title: String
      avatar: String
      file: Upload
    ): Status
    create_post(
      title: String!
      content: String!
      file: Upload
      category: String!
    ): Post!
    edit_post(
      title: String
      content: String
      file: Upload
      category: String
    ): Post!
    create_gif(file: Upload, title: String): Gif!
  }

  type Status {
    message: String
    value: Boolean
    user: Admin
    user_1: Employee
  }

  type Admin {
    _id: ID!
    f_name: String!
    l_name: String!
    email: String!
    phone_number: String!
    password: String!
    employees: [Employee!]
    no_of_employees: Int
    user_type: String
    avatar: String
  }

  type Employee {
    _id: ID!
    f_name: String
    l_name: String
    email: String
    phone_number: String
    password: String!
    employee_id: String!
    department: String
    address: String
    job_title: String
    posts: [Post!]
    gifs: [Gif]
    comments: [Comment!]
    no_of_posts: Int
    user_type: String
    avatar: String
    createdAt: Date
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    image: String
    flagged_as_inappropriate: Boolean
    category: String!
    creator: Employee!
    comments: [Comment!]
    createdAt: Date
    updatedAt: Date
  }

  type Gif {
    _id: ID!
    gif: String!
    title: String
    flagged_as_inappropriate: Boolean
    creator: Employee!
    comments: [Comment!]
    createdAt: Date
    updatedAt: Date
  }

  type Comment {
    _id: ID!
    comment: String!
    flagged_as_inappropriate: Boolean
    creator: Employee!
    createdAt: Date
    updatedAt: Date
  }

  type PostConnection {
    edges: [Post!]
    pageInfo: PageInfo!
  }

  type GifConnection {
    edges: [Gif!]
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: Date!
  }
`;
