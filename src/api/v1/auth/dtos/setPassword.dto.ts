import { IsEmail, IsString, Length, Matches } from "class-validator";

export default class SetPasswordDto {
    @IsEmail({}, { message: "Invalid email address" })
    public email: string;

    @IsString({ message: "OTP must be a string" })
    public otp: string;

    @IsString({ message: "New password must be a string" })
    @Length(8, 50, { message: "New password must be between 8 and 50 characters" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/, {
        message:
            "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    public newPassword: string;


    @IsString({ message: "Access Token string" })
    public accessToken: string;
}