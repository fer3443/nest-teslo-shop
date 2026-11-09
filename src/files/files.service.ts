import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService
  ){}
 
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path)) {
      throw new BadRequestException(`No se encontro el producto con la imagen ${imageName}`)
    }
    return path;
  };

  uploadProductImage(file: Express.Multer.File) {
    return file;
  }
}
