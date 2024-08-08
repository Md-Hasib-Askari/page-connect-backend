const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET as string;

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
};

const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
