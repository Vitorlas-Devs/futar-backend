import { Types } from "mongoose";

export default interface IUser {
    _id?: Types.ObjectId | string;
    name: string;
    email: string;
    auto_login: boolean;
    email_verified: boolean;
    picture: string;
    password: string;
    roles: string[];
}

export const exampleUser: IUser = {
    name: "student001",
    email: "student001@jedlik.eu",
    auto_login: false,
    email_verified: true,
    picture: "https://jedlik.eu/images/avatars/student001.jpg",
    password: "student001",
    roles: ["student"],
};
