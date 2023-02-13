// https://mongoosejs.com/docs/validation.html

import { Schema, model } from "mongoose";
import IKiszállítás from "./kiszállítás.interface";

const kiszállításSchema = new Schema<IKiszállítás>(
    {
        futár: { type: Schema.Types.ObjectId, ref: "Futár", required: true },
        nap: { type: Date, required: true },
        sorszám: { type: Number, required: true },
    },
    { versionKey: false },
);

const kiszállításModel = model<IKiszállítás>("Kiszállítások", kiszállításSchema);

export default kiszállításModel;
