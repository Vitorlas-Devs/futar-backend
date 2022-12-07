import { IsNumber, IsString } from "class-validator";

export default class CreateUtcakDto {
    @IsNumber()
    public _id: number;

    @IsString()
    public sav: number;

    @IsNumber()
    public ado: number;

    @IsNumber()
    public hatar: number;
}
