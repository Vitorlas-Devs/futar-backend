import { Schema, model } from "mongoose";
import IUtcak from "./utcak.interface";
// https://mongoosejs.com/docs/typescript.html
// https://mongoosejs.com/docs/validation.html

const utcakSchema = new Schema<IUtcak>(
    {
        _id: Number,
        adoszam: {
            type: Number,
            required: true,
            min: [10000, "Az adószám öt jegyű!"],
            max: [99999, "Az adószám öt jegyű!"],
        },
        utca: {
            type: String,
            required: true,
        },
        hazszam: {
            type: String,
            required: true,
            validate: {
                validator: function (v: string) {
                    return /^\d/.test(v);
                },
                message: "A házszámnak számjeggyel kell kezdődni!",
            },
        },
        adosav: {
            ref: "adosavok",
            type: Number,
            required: true,
        },
        terulet: {
            type: Number,
            required: true,
            min: [1, "A terület nem lehet nulla vagy negatív érték!"],
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const utcakModel = model("utcak", utcakSchema, "utcak");

export default utcakModel;
