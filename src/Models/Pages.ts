/*
* Pages model and schema for MongoDB
* */
import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
    pageID: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    name: { type: String },
}, {timestamps: true, versionKey: false});


const pageModel = mongoose.model('Pages', pageSchema);

export default pageModel;