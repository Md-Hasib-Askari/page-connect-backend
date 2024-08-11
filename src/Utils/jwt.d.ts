import { JwtPayload } from 'jsonwebtoken';
declare const generateToken: (userId: string, expiresIn: number) => string;
declare const verifyToken: (token: string) => string | JwtPayload;
export { generateToken, verifyToken };
