// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import IKiszállítás from "./kiszállítás.interface";

const kiszállításSchema = new Schema<IKiszállítás>(
    {
        _id: Number,
        nap: { type: Number, required: true },
        sorszám: { type: Number, required: true },
        megtettÚt: { type: Number, required: true },
        díj: { ref: "Díj", type: Number, required: true },
    },
    { versionKey: false },
);

const kiszállításModel = model<IKiszállítás>("Kiszállítások", kiszállításSchema, "kiszállítások");

export default kiszállításModel;
