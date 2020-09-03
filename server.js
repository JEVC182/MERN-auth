const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

//Connect to db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  .then(() => console.log('DB connected'))
  .catch((err) => console.log('Cannot connect', err));
//Import routes
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');

//App middleware
app.use(morgan('dev'));
//app.use(cors()); //Allow all request origin
app.use(bodyParser.json());

if ((process.env.NODE_ENV = 'development')) {
  app.use(cors({ origin: `http://localhost:3000/` }));
}
//middleware
app.use('/api', authRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`API is running on port ${port} - ${process.env.NODE_ENV}`);
});
