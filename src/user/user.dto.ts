/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsArray, ArrayNotEmpty, IsOptional, IsString, IsBoolean, IsEmail, ValidateIf, ValidateNested, IsInt } from "class-validator";
// import { Match } from "./match.decorator";
import CreateAddressDto from "./address.dto";

export default class CreateUserDto {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    // Example - compare two fields:
    // @IsEmail()
    // @Match("email", { message: "email and email_address_confirm don't match." })
    // public email_address_confirm: string;

    @IsBoolean()
    public email_verifed: boolean;

    @IsBoolean()
    public auto_login: boolean;

    @IsString()
    public picture: string;

    @IsString()
    public password: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    public roles: string[];

    @IsOptional()
    @ValidateNested()
    public address?: CreateAddressDto;
}
