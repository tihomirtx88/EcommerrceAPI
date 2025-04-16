const User = require("./../models/User");
const Token = require("./../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const {
  atachCookieToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendRessetPasswordEmail
} = require("./../utils/index");
const crypto = require("crypto");
const createHash = require("./../utils/createHash");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExist = await User.findOne({ email });

  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Email alredy exists!");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // For testing purpuse
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  const origin = "http://localhost:5000";

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken: user.verificationToken,
    origin,
  });

  // const tokenUser = createTokenUser(user);
  // atachCookieToResponse({res, user:tokenUser});
  // res.status(StatusCodes.CREATED).json({user: tokenUser});

  // For testing purpuse
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Success! Plase check your email verified token" });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email is Verified" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError.UnauthenticatedError(
      "Invalid Credentials.There is not user with that email or password"
    );
  }

  const isPasswordCorrect = await user.comparePasswords(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Password");
  }

  // For testing purpuse
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Invalid Verification");
  }

  const tokenUser = createTokenUser(user);

  //create refresh token
  let refreshToken = "";

  //check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;

    if (!isValid) {
      throw new CustomError.UnauthenticatedError(
        "Invalid Credentials. The token are not valid"
      );
    }

    refreshToken = existingToken.refreshToken;
    atachCookieToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  atachCookieToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({
    user: tokenUser,
    accessToken: accessTokenJWT,
    refreshToken: refreshTokenJWT
  });
};

const logout = async (req, res) => {

  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logout" });
};

const forgotPassword = async (req, res) => {
    //Check is it passed email from front end
    const { email } = req.body;

    if (!email) {
        throw new CustomError.BadRequestError("Please provide valid email!");
    }

    const user = await User.findOne({email});

    if (user) {
        const passwordToken = crypto.randomBytes(70).toString('hex');
        // Send email
        const origin = "http://localhost:5000";
        await sendRessetPasswordEmail({name: user.name, email: user.email, token: passwordToken, origin});

        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        await user.save();
    }
    
    res.status(StatusCodes.OK).json({msg: 'Please check your email for reset password link'});
};

const resetPassword = async (req, res) => {
    const { token, password, email } = req.body;

    if (!email || !password || token) {
        throw new CustomError.BadRequestError("Please provide all values");
    }

    const user = await User.findOne({user});

    if (user) {
        const currentDay = new Date();

        if (user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDay) {
            user.password = password;
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            await user.save();
        }
    }
    res.send('reset password');
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  resetPassword,
  forgotPassword
};
