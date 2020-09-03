//import express

//Importing
const express = require('express');
const router = express.Router();

//impport controller
const { signup, accountActivation } = require('../controllers/auth');

//import validator

const { userSignupValidator } = require('../validators/auth');
const { runValidation } = require('../validators');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);

module.exports = router; // {}
