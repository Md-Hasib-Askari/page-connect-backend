/*
* Users model and schema for MongoDB
* */
import mongoose, { Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

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

interface IUserDocument extends IUser, mongoose.Document {}

const userSchema: Schema<IUserDocument> = new mongoose.Schema<IUserDocument>({
    facebookID: { type: String, required: true, unique: true },
    accessToken: {
      token: String,
      expiresIn: Number,
   },
    name: { type: String },
    jwtToken: { type: String },
    page: String,
}, {timestamps: true, versionKey: false});

userSchema.pre('save', async function (this: any, next: any) {
   if (this.isModified('jwtToken')) {
      this.jwtToken = await bcrypt.hash(this.jwtToken, 10) as string;
   }
   next();
});

const userModel: Model<IUserDocument> = mongoose.model<IUserDocument>('Users', userSchema);

export { userModel, IUserDocument};