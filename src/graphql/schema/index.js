import { gql } from "apollo-server-express";

export default gql`
  scalar Date

  schema {
    query: Query
    mutation: Mutation
  }

  type Query {
    you: Status
  }

  type Mutation {
    image(file: Upload): Status
  }

  type Status {
    message: String
    value: Boolean
  }
`;
