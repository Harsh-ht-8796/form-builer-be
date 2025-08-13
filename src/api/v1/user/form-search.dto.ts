import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export default class UserSearchDto {

    @IsPositive()
    @IsOptional()
    limit!: number;

    @IsNumber()
    @IsOptional()
    page!: number;
    @IsString()
    @IsOptional()
    fromDate?: string;

    @IsString()
    @IsOptional()
    toDate?: string;


    @IsString()
    @IsOptional()
    email?: string;
}