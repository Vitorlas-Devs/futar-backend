import { Types } from "mongoose";
export default interface IUser {
    _id?: Types.ObjectId | string;
    name: string;
    email: string;
    auto_login: boolean;
    picture: string;
    password: string;
    roles: string[];
}
