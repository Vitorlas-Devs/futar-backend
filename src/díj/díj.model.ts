import { Schema, model } from "mongoose";
import IDíj from "./díj.interface";

const díjSchema = new Schema<IDíj>(
    {
        _id: Number,
        minKm: { type: Number, required: true },
        maxKm: { type: Number, required: true },
        összeg: { type: Number, required: true },
    },
    { versionKey: false },
);

const díjModel = model<IDíj>("Díj", díjSchema, "díjak");

export default díjModel;
