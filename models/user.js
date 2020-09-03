const mongoose = require('mongoose');
//Encrypt the password
const crypto = require('crypto');
const { match } = require('assert');
//User schema
//creating a new stance || new schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    //How hard hashing password is gonna be
    salt: String,
    role: {
      type: String,
      default: 'subscriber',
    },
    resetPasswordLink: {
      data: String,
      default: '',
    },
  },
  { timestamps: true }
);

//virtual field with mongoose

//Take the plain password and hashed the password and save in the db the hashed password
userSchema
  .virtual('password')
  .set(function (password) {
    //underscore make sure the variable password
    // is made use inside the function
    this._password = password;
    this.salt = this.makeSalt();
    //Encrypt the password
    this.hashed_password = this.encryptPassword(password);
  })
  //Get the hashed  password
  .get(function () {
    return this._password;
  });

// methods
//Compare the password
//plain password and hashed password
userSchema.methods = {
  authenticate: function (plainText) {
    //Password saved in the db
    return this.encryptPassword(plainText) == this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },
};
//Export
module.exports = mongoose.model('User', userSchema);
