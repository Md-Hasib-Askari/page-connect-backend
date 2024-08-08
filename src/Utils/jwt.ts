import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
};

const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, secret);
};

export { generateToken, verifyToken };