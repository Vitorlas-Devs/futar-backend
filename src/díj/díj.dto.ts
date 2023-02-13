/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString } from "class-validator";

export default class CreateDíjDto {
    @IsString()
    public minKm: string;

    @IsString()
    public maxKm: string;

    @IsString()
    public összeg: string;
}
