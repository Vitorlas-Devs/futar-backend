import { Types } from "mongoose";
export default interface IUser {
    _id?: Types.ObjectId | string;
    name: string;
    email: string;
    password: string;
    roles: string[];
}
