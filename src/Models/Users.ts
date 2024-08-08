/*
* Users model and schema for MongoDB
* */
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    facebookID: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
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

const userModel = mongoose.model('Users', userSchema);

export default userModel;
// module.exports = userModel;