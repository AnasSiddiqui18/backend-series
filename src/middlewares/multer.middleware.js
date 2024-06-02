import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    console.log("multer file object", file);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // with this code we are giving the file a random number something like this 1717036800000-98765432 ensuring there's no mismatch in the file names.

    console.log("multer function is running");

    console.log("file original name", file.originalname);

    const fileEx = file.originalname;
    const splitRes = fileEx.split(".");

    console.log("field name", file.fieldname); 

    cb(null, file.fieldname + "-" + uniqueSuffix + "." + splitRes[1]); // something like this profile.jpg = profile-1717036800000-98765432.jpg
    // the reason why we are putting null in the first parameter of the callback function is that in Node Js it's a convention in call back functions that we have to write error in the first parameter and if we dont' need the error case so we can simply put null their
  },
});

export const upload = multer({
  storage,
}); // the path in the dest is the path where all the files will get upload when we upload a file using multer.
