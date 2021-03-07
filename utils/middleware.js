const logger = require('./logger');

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'Unknown endpoint!' });
};

const errorHandler = (error, req, res, next) => {
  logger.error('ERROR NAME:', error.name);
  logger.error('ERROR MESSAGE:', error.message);
  logger.error('FULL ERROR:', error);
  switch (error.name) {
  case 'CastError':
    return res.status(400).json({ error: 'Malformatted id!' }).end();
  case 'ValidationError':
    return res.status(400).json({ error: error.message }).end();
  case 'PostNotFound':
    return res.status(400).json({ error: 'Post not found on a server!' });
  case 'JsonWebTokenError':
    return res.status(401).json({ error: 'ErrHandler: token is missing or invalid' });
  default:
    return next(error);
  }
};

// Extracting the token from req.headers.authorization
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  // Checking if header is present and valid
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
    return next();
  }
  return next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
};
