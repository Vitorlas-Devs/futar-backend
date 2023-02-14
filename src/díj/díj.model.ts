import { Schema, model } from "mongoose";
import IDíj from "./díj.interface";

const díjSchema = new Schema<IDíj>(
    {
        futár: { type: Schema.Types.ObjectId, ref: "Futár", required: true },
        minKm: { type: Number, required: true },
        maxKm: { type: Number, required: true },
        összeg: { type: Number, required: true },
    },
    { versionKey: false },
);

const díjModel = model<IDíj>("Díj", díjSchema, "díjak");

export default díjModel;
