/*
* Pages model and schema for MongoDB
* */
import mongoose, { Model, Schema, Document } from 'mongoose';

interface IPage {
    pageID: string,
    accessToken: {
        token: string,
        expires: number
    },
    name: string
}

interface IPageDocument extends IPage, Document {}

const pageSchema: Schema = new mongoose.Schema<IPageDocument>({
    pageID: { type: String, required: true, unique: true },
    accessToken: {
        token: String,
        expires: Number
    },
    name: String ,
}, {timestamps: true, versionKey: false});


const PageModel: Model<IPageDocument> = mongoose.model<IPageDocument>('Pages', pageSchema);

export { PageModel, IPageDocument };