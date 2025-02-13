const CustomError = require("./../errors");
const { isTokeValid } = require("./../utils/index");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication is not valid");
  }

  try {
    req.user = { name, role, userId };
    const { name, userId, role } = isTokeValid({ token });
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication is not valid");
  }
};

module.exports = {
  authenticateUser,
};
