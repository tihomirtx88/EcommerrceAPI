const User = require("./../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { atachCookieToResponse } = require("./../utils/index");

const register = async (req, res) => {
    const { email, name, password } = req.body;

    const emailAlreadyExist = await User.findOne({email});

    if (emailAlreadyExist) {
        throw new CustomError.BadRequestError('Email alredy exists!');
    }

    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({name, email, password, role});
    
    const tokenUser = {
        name: user.name,
        userId: user._id,
        role: user.role
    };

    atachCookieToResponse({res, user:tokenUser});

    res.status(StatusCodes.CREATED).json({user: tokenUser});
};

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
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const tokenUser = {
        name: user.name,
        userId: user._id,
        role: user.role
    };

    atachCookieToResponse({res, user:tokenUser});

    res.status(StatusCodes.CREATED).json({user: tokenUser});

};

const logout = async (req, res) => {
    res.send('ok');
};

module.exports= {
    register, 
    login,
    logout
};