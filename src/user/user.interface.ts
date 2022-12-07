import { Types } from "mongoose";
export default interface User {
    _id: Types.ObjectId | string;
    name: string;
    email: string;
    password: string;
    address?: {
        street: string;
        city: string;
        country: string;
    };
}
