import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
); // use method in express is use for middlewares or for do some configuration settings.
app.use(express.json({ limit: "16kb" })); // setting the limit of json
app.use(express.urlencoded({ extendeed: true, limit: "16kb" })); // to encode the url
app.use(express.static("public")); // to store any pdf, image or static assets in the public folder
app.use(cookieParser()); // To access user browser cookie and also make some changes in it. This middleware give us the ability to access cookie in req, res parameters.

// routes
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
export { app };

// http://localhost:8000/api/v1/users/register
