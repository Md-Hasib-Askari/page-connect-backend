/*
* Pages model and schema for MongoDB
* */
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    pageID: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    name: { type: String },
}, {timestamps: true, versionKey: false});


const pageModel = mongoose.model('Pages', pageSchema);
module.exports = pageModel;