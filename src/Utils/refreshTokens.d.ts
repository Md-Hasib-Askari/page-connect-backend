import { IPageDocument } from "../Models/Pages";
export declare const refreshPageToken: (page: IPageDocument, userToken: string) => Promise<void>;
export declare const getUserTokenInfo: (userToken: string) => Promise<any>;
