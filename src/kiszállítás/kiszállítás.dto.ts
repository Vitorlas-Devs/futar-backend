import { IsDate, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import IKiszállítás from "./kiszállítás.interface";

export default class CreateKiszállításDto implements IKiszállítás {
    @IsDate()
    @IsNotEmpty()
    public nap: Date;

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
    public fizetésId: number;
}
