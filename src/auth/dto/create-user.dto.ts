import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "User email (unique)",
    example: "user@example.com"
  })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "Password: must contain an uppercase letter, a lowercase letter and a number",
    example: "Abc12345",
    minLength: 6,
    maxLength: 50
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'
  })
  password!: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  fullName!: string;
}