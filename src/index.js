import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });

    console.log("then is working");

    // process.exit(0); // this line is use to successfully exit the node js process
  })
  .catch((err) => {
    console.log("MONGODB connection failed::", err);
    process.exit(1); // if the database connection has issues so this line will throw an error
  });
