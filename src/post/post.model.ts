import { Schema, model } from "mongoose";
import IPost from "./post.interface";

const postSchema = new Schema<IPost>(
    {
        author: {
            ref: "User",
            type: Schema.Types.ObjectId,
        },
        content: String,
        title: String,
    },
    { versionKey: false },
);

const postModel = model<IPost>("Post", postSchema);

export default postModel;
