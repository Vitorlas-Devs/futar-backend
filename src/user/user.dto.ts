import { IsOptional, IsString, ValidateNested } from "class-validator";
import CreateAddressDto from "./address.dto";

export default class CreateUserDto {
    @IsString()
    public name: string;

    @IsString()
    public email: string;

    @IsString()
    public password: string;

    @IsOptional()
    @ValidateNested()
    public address?: CreateAddressDto;
}
