import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from "class-validator";

export class DeleteFileDto {
  @ApiProperty({
    description: "Cloudinary public id of a single image to delete",
    example: "uploads/abc123",
    required: false
  })
  @IsString()
  @IsOptional()
  public_id!:string;

  @ApiProperty({
    description: "Cloudinary public ids of several images to delete (1 to 20)",
    example: ["uploads/abc123", "uploads/def456"],
    type: [String],
    minItems: 1,
    maxItems: 20,
    required: false
  })
  @IsString({each:true})
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsOptional()
  public_ids!:string[]
}
