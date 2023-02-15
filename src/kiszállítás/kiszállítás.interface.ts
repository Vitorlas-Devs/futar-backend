import { Types } from "mongoose";
export default interface IKiszállítás {
    _id?: Types.ObjectId | string;
    nap: Date;
    sorszám: number;
    megtettÚt: number;
    fizetésId: number;
}
