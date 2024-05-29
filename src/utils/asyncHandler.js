export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      console.log("error trigger", err);

      next(err);
    });
  };
};

// export const asyncHandler = (fn) => async (req, res, next) => {
//   console.log("async handler got triggered");

//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     console.log("error trigger", error);
//     res.status(error.statusCode || 500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };
