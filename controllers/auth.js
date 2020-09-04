const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
    //Mail template
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `<h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
          <hr />
          <p>This email contain sensitive information</p>
          <p>${process.env.CLIENT_URL}</p>
          `,
    };
    //
    sgMail.send(emailData).then(
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
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
      err,
      decode
    ) {
      if (err) {
        console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
        return res.status(401).json({
          error: 'Expired Link. Signup again',
        });
      }
      const { name, email, password } = jwt.decode(token);

      const user = new User({ name, email, password });

      user.save((err, user) => {
        if (err) {
          console.log('SAVE USER N ACCOUNT ACTIVATION ERROR', err);
          return res.status(401).json({
            error: 'Errro saving in database. Try signup again',
          });
        }
        return res.json({
          message: 'Signup success. Please signing',
        });
      });
    });
  } else {
    return res.json({
      message: 'Something went wrong, try again',
    });
  }
};

//
exports.signin = (req, res) => {
  const { email, password } = req.body;
  //Check if user exits
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exits. Please signup.',
      });
    }
    //authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and password do not match',
      });
    }
    //generate token and sent to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};
