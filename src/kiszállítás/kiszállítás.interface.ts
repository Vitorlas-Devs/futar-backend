import { Types } from "mongoose";
export default interface IKiszállítás {
    _id?: Types.ObjectId | string;
    futár?: Types.ObjectId | string;
    nap: Date;
    sorszám: number;
    megtettÚt: number;
}
