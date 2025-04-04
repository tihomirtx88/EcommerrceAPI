const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
    select: false 
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken:String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verified: Date,
  // Forrgot password functionality
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type:Date
  }
});

UserSchema.pre('save', async function(){
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePasswords = async function (candidatPassword) {
    const isMatch = await bcrypt.compare(candidatPassword, this.password);
    return isMatch;
}

module.exports = mongoose.model('User', UserSchema);
