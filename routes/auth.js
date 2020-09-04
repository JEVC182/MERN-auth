//import express

//Importing
const express = require('express');
const router = express.Router();

//impport controller
const { signup, accountActivation, signin } = require('../controllers/auth');

//import validator

const {
  userSignupValidator,
  userSigninValidator,
} = require('../validators/auth');
const { runValidation } = require('../validators');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);

module.exports = router; // {}
