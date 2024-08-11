import { Model, Document } from 'mongoose';
interface IPage {
    pageID: string;
    accessToken: {
        token: string;
        expires: number;
    };
    name: string;
}
interface IPageDocument extends IPage, Document {
}
declare const PageModel: Model<IPageDocument>;
export { PageModel, IPageDocument };
