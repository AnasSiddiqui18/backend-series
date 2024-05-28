import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    console.log(`\n Database name: ${connectionInstance.connection.name}`);
    console.log(`\n Connection port: ${connectionInstance.connection.port}`);
  } catch (error) {
    console.error(`MONGODB connection failed:: ${error.message}`);

    throw error.message; // throw error when the connection operation got failed
  }
};

export default connectDb;
