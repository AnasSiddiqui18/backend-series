import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs stands for file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log("local file path", localFilePath);

    //upload the file on cloudinary

    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully

    console.log("file is uploaded on cloudinary", cloudinaryResponse);
    console.log("cloudinary url", cloudinaryResponse.url);

    fs.unlinkSync(localFilePath); // removing the file from local storage when the file uploaded on cloudinary successfully

    return cloudinaryResponse;
  } catch (error) {
    fs.unlinkSync(localFilePath); // when there's any issue while uploading file to cloudinary so this code will remove the local saved file.
    return null;
  }
};

export { uploadOnCloudinary };

// file upload agenda:

// first when the user uploads the file by using multer package we will then save the file in our server and then we will upload the file on cloudinary.
