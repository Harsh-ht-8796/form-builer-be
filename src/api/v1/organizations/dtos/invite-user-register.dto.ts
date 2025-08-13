import { ArrayMinSize, IsArray, IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { UserRole } from '@common/types/roles';
import { Type } from 'class-transformer';

export default class InviteRegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
  
  @IsNotEmpty()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];
}


export class InviteRegisterArrayDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InviteRegisterDto)
  users!: InviteRegisterDto[];
}