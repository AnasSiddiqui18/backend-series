import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message

  return res.status(200).json({
    status: "OK",
    message: "everything is working ✅",
  });
});

export { healthcheck };
