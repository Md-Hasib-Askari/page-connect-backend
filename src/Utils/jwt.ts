import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

const generateToken = (userId: string, expiresIn: string) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, secret);
};

export { generateToken, verifyToken };