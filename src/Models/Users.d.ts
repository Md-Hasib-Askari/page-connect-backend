import mongoose, { Model } from 'mongoose';
interface IUser {
    facebookID: string;
    accessToken: {
        token: string;
        expiresIn: number;
    };
    name: string;
    jwtToken: string;
    page: string;
}
interface IUserDocument extends IUser, mongoose.Document {
}
declare const userModel: Model<IUserDocument>;
export { userModel, IUserDocument };
