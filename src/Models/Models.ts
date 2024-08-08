/*
* Add all your Models and Schemes here and export them
* */
import mongoose from 'mongoose';

const testModelSchema = new mongoose.Schema({
    title: {
       type: mongoose.Schema.Types.String,
       required: true
    },
    description: {
       type: String,
    }
}, {timestamps: true, versionKey: false});

const testModel = mongoose.model('tableName', testModelSchema);

export default testModel;