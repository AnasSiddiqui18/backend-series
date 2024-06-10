import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs stands for file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteLocalFile = (localFilePath) => {
  fs.access(localFilePath, fs.constants.F_OK, (err) => {
    // fs.access is a method provided by file system that check's the accessibility of a file.
    // fs.constants.F_OK is a method provided by file system that check's the presence of a file.

    if (!err) {
      fs.unlink(localFilePath, (err) => {
        if (err) {
          console.log(`Failed to delete ${localFilePath}`, err);
        } else {
          console.log(`${localFilePath} successfully deleted`);
        }
      });
    } else {
      console.log(`Local file does not exist ${localFilePath}`, err);
    }
  });
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary

    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully

    console.log("file is uploaded on cloudinary", cloudinaryResponse);
    console.log("cloudinary url", cloudinaryResponse.url);

    deleteLocalFile(localFilePath); // removing the file from local storage when the file uploaded on cloudinary successfully

    return cloudinaryResponse;
  } catch (error) {
    deleteLocalFile(localFilePath); // when there's any issue while uploading file to cloudinary so this code will remove the local saved file.
    return null;
  }
};

const deletePreviousImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.log(`error while deleting the previous image`, error);
      } else {
        console.log(`previous file deleted successfully`, result);
      }
    });
  } catch (error) {}
};

const deleteImageFromCloudinary = (url) => {
  const publicId = url.split("/").pop().split(".")[0];
  return publicId;
};

export { uploadOnCloudinary, deletePreviousImage, deleteImageFromCloudinary };

// file upload agenda:

// first when the user uploads the file by using multer package we will then save the file in our server and then we will upload the file on cloudinary.
