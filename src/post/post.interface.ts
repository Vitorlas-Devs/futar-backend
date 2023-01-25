import { Types } from "mongoose";
export default interface IPost {
    _id: Types.ObjectId | string;
    author: Types.ObjectId | string;
    content: string;
    title: string;
}
