import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// mongoose.set("debug", true); // To Log DB actions on the console
mongoose.Promise = global.Promise; // To Use Promises With Mongoose

// Connect to DB
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }); // { useNewUrlParser: true }: To remove depreciation Warnings

// Message On if Successfully Connected to DB
mongoose.connection.on("connected", () => {
  console.log(`Connected to database ${process.env.DB_URL}`);
});

// Message On if There is an error in database Connection
mongoose.connection.on("error", err => {
  console.log(`Database Error: ${err}`);
});

// To Remove moongoose depreciation warnings
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
