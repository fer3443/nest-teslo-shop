import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ProductImageDto {
  @ApiProperty({
    description: "Cloudinary public id of the image",
    example: "uploads/abc123"
  })
  @IsString()
  public_id!: string;

  @ApiProperty({
    description: "Cloudinary secure URL of the image",
    example: "https://res.cloudinary.com/demo/image/upload/v1/uploads/abc123.jpg"
  })
  @IsString()
  secure_url!: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: "Product title (unique)",
    nullable: false,
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  @IsString({ each: true })//obligo a que cada uno de los elementos dentro del array sea una string
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @ApiProperty()
  @IsString()
  @IsIn(['men', 'women', 'kid'])//solo permite estos tipos de valores
  gender!: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[]

  @ApiProperty({ type: () => [ProductImageDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)//sin esto class-validator no conoce las reglas de cada imagen
  @IsArray()
  @IsOptional()
  images?: ProductImageDto[]
}
