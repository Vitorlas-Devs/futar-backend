// https://mongoosejs.com/docs/validation.html#built-in-validators

import { Schema, model } from "mongoose";
import IAdosavok from "./adosavok.interface";

const adosavokSchema = new Schema<IAdosavok>(
    {
        _id: Number,
        sav: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 1,
            maxlength: 1,
        },
        ado: {
            type: Number,
            required: true,
        },
        hatar: {
            type: Number,
            required: true,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const onesideModel = model("adosavok", adosavokSchema, "adosavok");

export default onesideModel;
