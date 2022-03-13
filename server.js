import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dbConnection from "./database/connection.js";
import expressSanitizer from "express-sanitizer";
import mongoSanitize from "express-mongo-sanitize";
import ErrorHandler from "./utils/error-handler.js";
import { user } from "./api/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const startServer = () => {
  try {
    dbConnection();

    app.use(expressSanitizer());

    app.use(mongoSanitize());

    app.use(helmet());

    app.use(express.json({ limit: "1mb" }));

    app.use(cookieParser());

    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: "1mb",
      })
    );

    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );

    //api
    user(app);

    app.use(ErrorHandler);

    app
      .listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
      })
      .on("error", (err) => {
        console.log(err);
        process.exit();
      });
  } catch (error) {
    throw new Error(error);
  }
};

startServer();
