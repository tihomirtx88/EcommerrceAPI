const Token = require("../models/Token");
const CustomError = require("./../errors");
const { isTokeValid, atachCookieToResponse } = require("./../utils/index");

const authenticateUser = async (req, res, next) => {
  // const token = req.signedCookies.token;

  // if (!token) {
  //   throw new CustomError.UnauthenticatedError("Authentication is not valid");
  // }

  const { accessToken, refreshToken } = req.signedCookies;

  try {
    // const { name, userId, role } = isTokeValid({ token });
    // req.user = { name, role, userId };
    // next();

    if (accessToken) {
      const payload = isTokeValid(accessToken);
      req.user = payload.user;
      return next();
    }

    const payload = isTokeValid(refreshToken);

    const existingToken = await Token.findOne({user: payload.user.userId, refreshToken: payload.refreshToken});

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication is not valid");
    }
    
    atachCookieToResponse({res, user: payload.user, refreshToken: existingToken.refreshToken});
    req.user = payload.user;
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
