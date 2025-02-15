const CustomError = require("./../errors");
const { isTokeValid } = require("./../utils/index");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication is not valid");
  }

  try {
    const { name, userId, role } = isTokeValid({ token });
    req.user = { name, role, userId };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication is not valid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnAuthorizedError(
        "Unathorized to access this route"
      );
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
