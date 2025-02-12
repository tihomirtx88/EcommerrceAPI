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
    res.send('ok');
};

const logout = async (req, res) => {
    res.send('ok');
};

module.exports= {
    register, 
    login,
    logout
};