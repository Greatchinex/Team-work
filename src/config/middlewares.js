import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware Function to protect Certain routes/resolvers in the application
const isAuth = (req, res, next) => {
  // Check incoming request header for "Authorization" field
  const authHeader = req.get("Authorization");
  // If there is no "Authorization" in header the request should return an unauthorized
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1];
  // If there is no token in the header: the request should return an unauthorized
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }

  // Verify the token
  let decodedToken;
  try {
    // If there is a token
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  // Check if decode token is not set
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  // Valid token
  req.isAuth = true;
  // Add user id to the token field
  req.userId = decodedToken.userId;
  // Add user type to the token field
  req.userType = decodedToken.userType;
  next();
};

export default app => {
  app.use(isAuth);
};
