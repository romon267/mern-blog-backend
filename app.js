const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const postsRouter = require('./controllers/posts');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const resetRouter = require('./controllers/testReset');
require('express-async-errors');

const app = express();
logger.info('Connecting to mongodb...', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('Connected to MongoDB!');
  })
  .catch((err) => {
    logger.error(err);
  });

// Loggin each requests details to the console using 'morgan' package
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan('tiny'));
app.use(morgan('POST body: :body', {
  skip: (req) => req.method !== 'POST',
}));

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use(middleware.tokenExtractor);

app.use('/api/login', loginRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', resetRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
