import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export default class FormSearchDto {

    @IsPositive()
    @IsOptional()
    limit!: number;

    @IsNumber()
    @IsOptional()
    page!: number;

    @IsEnum(['draft', 'published'])
    @IsOptional()
    status?: 'draft' | 'published';

    @IsString()
    @IsOptional()
    fromDate?: string;

    @IsString()
    @IsOptional()
    toDate?: string;

    @IsString()
    @IsOptional()
    mode?: string;

}