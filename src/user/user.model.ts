import { Schema, model } from "mongoose";
import User from "./user.interface";

const addressSchema = new Schema(
    {
        city: String,
        country: String,
        street: String,
    },
    { versionKey: false },
);

const userSchema = new Schema<User>(
    {
        address: addressSchema,
        email: String,
        name: String,
        password: String,
    },
    { versionKey: false },
);

const userModel = model<User>("User", userSchema);

export default userModel;
