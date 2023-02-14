/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNumber, IsPositive, IsNotEmpty } from "class-validator";

export default class CreateDíjDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public minKm: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public maxKm: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public összeg: number;
}
