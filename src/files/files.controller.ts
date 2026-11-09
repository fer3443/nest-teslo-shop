import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
  Body,
  InternalServerErrorException
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DeleteFileDto } from './dto/delete-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly cloudinary: CloudinaryService,
    private readonly configService: ConfigService
  ) { }

  // @Get('product/:imageName')
  // findOneProductImage(
  //   @Res() res: Response,
  //   @Param('imageName') imageName:string
  // ){
  //   const path = this.filesService.getStaticProductImage(imageName)
  //   res.sendFile(path)
  // }

  // @Post('product')
  // @UseInterceptors(FileInterceptor('file', {
  //   fileFilter: fileFilter,
  //   storage: diskStorage({
  //     destination:'./static/products',
  //     filename: fileNamer
  //   })
  // }))
  // uploadFile(
  //   @UploadedFile() file: Express.Multer.File
  // ) {

  //   if (!file) {
  //     throw new BadRequestException('Asegurese que el archivo es una imagen')
  //   }
  //   return {
  //     fileName: file.originalname,
  //     secure_url: `${this.configService.get('HOST_API')}/files/product/${file.filename}`
  //   }
  // }
  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        ]
      })
    ) file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('Asegurese que el archivo es una imagen')
    const result = await this.cloudinary.uploadFile(file, 'uploads')
    return { public_id: result.public_id, secure_url: result.secure_url }
  }

  //TODO: aqui solamente llamo al servicio que actualiza (falta crear el update-file.dto)
  @Post('product/update')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Body() { public_id }: UpdateFileDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('Asegurese que el archivo es una imagen')
    if (!public_id) throw new BadRequestException('Debe proporcionar el id de las imagene')
    const deletedFile = await this.cloudinary.deleteFile(public_id)
    if(deletedFile.result !== "ok") throw new InternalServerErrorException('Hubo un problema al intentar eliminar la imagen')
    const result = await this.cloudinary.uploadFile(file, 'uploads')
    return { public_ids: result.public_id, secure_url: result.secure_url }

  }

  @Delete('product')
  async deleteFile(
    @Body() deleteFileDto: DeleteFileDto
  ) {
    return await this.cloudinary.deleteFile(deleteFileDto.public_id)
  }

  @Delete('product/multiple')
  async deleteMultipleFiles(
    @Body() { public_ids }: DeleteFileDto
  ) {
    return await this.cloudinary.deleteResources(public_ids)
  }
}
