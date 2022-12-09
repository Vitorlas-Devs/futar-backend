/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUrl } from "class-validator";

export default class CreateRecipeDto {
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
