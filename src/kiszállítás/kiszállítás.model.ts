// https://mongoosejs.com/docs/validation.html

import { Schema, model } from "mongoose";
import IKiszállítás from "./kiszállítás.interface";

const kiszállításSchema = new Schema<IKiszállítás>(
    {
        nap: { type: Date, required: true },
        sorszám: { type: Number, required: true },
        megtettÚt: { type: Number, required: true },
        fizetésId: { ref: "Díj", type: Number, required: true },
    },
    { versionKey: false },
);

const kiszállításModel = model<IKiszállítás>("Kiszállítások", kiszállításSchema, "kiszállítások");

export default kiszállításModel;
