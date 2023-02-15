import { Types } from "mongoose";
export default interface IDíj {
    _id: Types.ObjectId | string;
    minKm: number;
    maxKm: number;
    összeg: number;
}
