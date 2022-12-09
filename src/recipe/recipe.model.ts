// https://mongoosejs.com/docs/validation.html

import { Schema, model } from "mongoose";
import IRecipe from "./recipe.interface";

const recipeSchema = new Schema<IRecipe>(
    {
        author: {
            ref: "User",
            type: Schema.Types.ObjectId,
        },
        recipeName: String,
        imageURL: String,
        description: String,
        ingredients: Array,
    },
    { versionKey: false },
);

const recipeModel = model<IRecipe>("Recipes", recipeSchema);

export default recipeModel;
