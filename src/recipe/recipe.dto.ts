import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUrl } from "class-validator";
import IRecipe from "./recipe.interface";

export default class CreateRecipeDto implements IRecipe {
    @IsNotEmpty()
    @IsString()
    public recipeName: string;

    @IsNotEmpty()
    @IsUrl()
    @IsString()
    public imageURL: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsArray()
    @ArrayNotEmpty()
    public ingredients: string[];
}
