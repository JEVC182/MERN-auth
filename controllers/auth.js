const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SP = require('sparkpost');
const SparkPost = require('sparkpost');
const client = new SparkPost('process.env.SPARKPOST_API_KEY');
//const sgMail = require('@sendgrid/mail');
//sgMail.setApiKey(process.env.SENDGRID_API_KEY);
/*exports.signup = (req, res) => {
  console.log(req.body);

  const { name, email, password } = req.body;

  User.findOne({ email: email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken',
      });
    }
  });

  let newUser = new User({ name, email, password });
  newUser.save((err, succes) => {
    if (err) {
      console.log('SIGNUP ERROR', err);
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: 'Signup Sucess! Please signing',
    });
  });
};
*/
//Function to send email through Sendgrid
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken',
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: '10m' }
    );
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `<h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/auth/activate${token}</p>
          <hr />
          <p>This email contain sensitive information</p>
          <p>${process.env.CLIENT_URL}</p>
          `,
    };

    client.transmissions.send(emailData).then(
      (sent) => {
        console.log(`Email has been sent to ${email}. Follow the instruction`);
        return res.json({
          message: `Email has been sent to ${email}. Follow the instruction`,
        });
      },
      (err) => {
        console.log(err);

        if (err.response) {
          console.log(err.response.body);
        }
      }
    );
  });
};

//Activation account

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    //verify if is valid token
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
      err,
      decoded
    ) {
      if (err) {
        console.log('There are errors', err);
        return res.status(401).json({
          error: 'Expired link. Sign up',
        });
      }
      const { name, email, password } = jwt.decode();

      const user = new User({ name, email, password });

      user.save((err, user) => {
        if (err) {
          console.log('Save user in account activation error', err);
          return res.status(401).json({
            error: 'Error saving user in database. Try signup again',
          });
        }
        return res.json({
          message: 'Signup success. Please signing',
        });
      });
    });
  } else {
    return res.json({
      message: 'Something weent wrong, try again!',
    });
  }
};
