const User = require("./../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { atachCookieToResponse, createTokenUser } = require("./../utils/index");
const crypto = require("crypto");
const sendEmail = require("./../utils/sendEmail");

const register = async (req, res) => {
    const { email, name, password } = req.body;

    const emailAlreadyExist = await User.findOne({email});

    if (emailAlreadyExist) {
        throw new CustomError.BadRequestError('Email alredy exists!');
    }

    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    

    // For testing purpuse
    const verificationToken = crypto.randomBytes(40).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken,
    });

    await sendEmail({
        to: email,
        subject: "Verify Your Email",
        text: `Your verification token is: ${verificationToken}`,
        html: `<p>Your verification token is: <strong>${verificationToken}</strong></p>`,
    });
    
    // const tokenUser = createTokenUser(user);
    // atachCookieToResponse({res, user:tokenUser});
    // res.status(StatusCodes.CREATED).json({user: tokenUser});
    
    // For testing purpuse
    res.status(StatusCodes.CREATED).json({msg: 'Success! Plase check your email verified token'});
};

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    if (user.verificationToken !== verificationToken) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = '';

    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Email is Verified' });
}


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    
    const user = await User.findOne({email}).select('+password');
 
    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const isPasswordCorrect = await user.comparePasswords(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Password');
    }
    
    // For testing purpuse
    if (!user.isVerified) {
        throw new CustomError.UnauthenticatedError('Invalid Verification');
    }

    const tokenUser = createTokenUser(user);

    // create refresh token
    let refreshToken = '';
    refreshToken = crypto.randomBytes(40).toString('hex');

    atachCookieToResponse({res, user:tokenUser});

    res.status(StatusCodes.OK).json({user: tokenUser});

};

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 1000),
    });

    res.status(StatusCodes.OK).json({msg: 'user logout'});
};

module.exports= {
    register, 
    login,
    logout,
    verifyEmail
};