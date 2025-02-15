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

const authorizePermissions = async (req, res, next) => {
     if (req.user.role !== 'admin') {
        throw new CustomError.UnAuthorizedError("Unathorized to access this route");
     }

     next();
};

module.exports = {
  authenticateUser,
  authorizePermissions
};
