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
    image(file: Upload): Status
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
    posts: [Post!]
    gifs: [Gif]
    comments: [Comment!]
    no_of_employees: Int
    user_type: String
    avatar: String
  }

  type Employee {
    _id: ID!
    f_name: String!
    l_name: String!
    email: String!
    phone_number: String!
    password: String!
    employee_id: String!
    department: String
    address: String
    job_title: String
    posts: [Post!]
    gifs: [Gif]
    comments: [Comment!]
    no_of_employees: Int
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
`;
