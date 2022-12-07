import { IsNumber, IsString } from "class-validator";

export default class CreateUtcakDto {
    @IsNumber()
    public _id: number;

    @IsNumber()
    public adoszam: number;

    @IsString()
    public utca: string;

    @IsString()
    public hazszam: string;

    @IsNumber()
    public adosav: number;

    @IsNumber()
    public terulet: number;
}
