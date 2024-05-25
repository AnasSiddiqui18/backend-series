import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODO_URI}/${DB_NAME}`
    );

    console.log(
      `\n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    console.log(`\n Database name: ${connectionInstance.connection.name}`);
    console.log(`\n Connection port: ${connectionInstance.connection.port}`);

    process.exit(0); //  if the try block executes successfully so this line wil causes
    // the Node.js process to exit immediately.
  } catch (error) {
    console.log("MONGODB connection error", error);
    console.log("Exiting the process due to database connection failure.");
    process.exit(1); //  process.exit(1) indicates an error
  }
};

export default connectDb;
