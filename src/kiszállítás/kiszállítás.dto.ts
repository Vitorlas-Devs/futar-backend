import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export default class CreateKiszállításDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public nap: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public sorszám: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public megtettÚt: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public díj: number;
}
