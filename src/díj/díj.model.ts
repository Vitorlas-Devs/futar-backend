import { Schema, model } from "mongoose";
import IDíj from "./díj.interface";

const díjSchema = new Schema<IDíj>(
    {
        _id: Number,
        minKm: { type: Number, required: true },
        maxKm: {
            type: Number,
            required: true,
            validate: {
                validator: function (v: number) {
                    return v > this.minKm;
                },
                message: "maxKm must be greater than minKm",
            },
        },
        összeg: { type: Number, required: true },
    },
    { versionKey: false },
);

const díjModel = model<IDíj>("Díj", díjSchema, "díjak");

export default díjModel;
