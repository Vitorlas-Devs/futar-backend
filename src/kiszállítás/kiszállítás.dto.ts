import { IsDate, IsNotEmpty, IsNumber } from "class-validator";
import IKiszállítás from "./kiszállítás.interface";

export default class CreateKiszállításDto implements IKiszállítás {
    @IsNotEmpty()
    @IsDate()
    public nap: Date;

    @IsNotEmpty()
    @IsNumber()
    public sorszám: number;

    @IsNotEmpty()
    @IsNumber()
    public megtettÚt: number;
}
