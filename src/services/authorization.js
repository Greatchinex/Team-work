import { AuthenticationError } from "apollo-server-express";
import { combineResolvers, skip } from "graphql-resolvers";

/*
    Functions to protect Various resolvers based on permission levels
*/

// Check if user is logged in
export const isAuthenticated = (_, __, { logged_in_user }) =>
  logged_in_user ? skip : new AuthenticationError("Authorization Denied");

// Check if user is an admin (Role based authentication)
export const isEducator = combineResolvers(
  isAuthenticated,
  (_, __, { user_type }) =>
    user_type === "admin"
      ? skip
      : new AuthenticationError("Not Authorized as an Admin")
);

// Check if user is an employee (Role based authentication)
export const isEmployee = combineResolvers(
  isAuthenticated,
  (_, __, { user_type }) =>
    user_type === "employee"
      ? skip
      : new AuthenticationError("Not Authorized as an Employee")
);
