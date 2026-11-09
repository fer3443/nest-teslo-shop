import { PartialType } from "@nestjs/swagger";
import { DeleteFileDto } from "./delete-file.dto";

export class UpdateFileDto extends PartialType(DeleteFileDto){}
