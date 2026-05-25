import { getCollection } from "../../common/config/db/connection.js";
import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import { ObjectId } from "mongodb";

export const checkUserValid = async function (req, res) {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("Not Authenticated !");
  }

  let decode;
  try {
    decode = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const tokenUserId =
    typeof decode?.id === "string" ? decode.id : decode.id.toString();

  if (!tokenUserId || !ObjectId.isValid(tokenUserId)) {
    throw ApiError.unauthorized("Invalid token payload");
  }

  const user = await getCollection("users").findOne(
    { _id: new ObjectId(tokenUserId) },
    {
      projection: {
        verificationToken: 0,
        password: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
        refreshToken: 0,
      },
    },
  );

  if (!user) {
    throw ApiError.notFound("user not found !!");
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const authenticate = async function (req, res, next) {
  await checkUserValid(req, res);
  next();
};

export { authenticate };
