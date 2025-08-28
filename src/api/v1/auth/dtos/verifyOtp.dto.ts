import { IsEmail, IsString } from "class-validator";

export default class VerifyOtpDto {
  @IsEmail({}, { message: "Invalid email address" })
  public email!: string;

  @IsString({ message: "OTP must be a string" })
  public otp!: string;
}