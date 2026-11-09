import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    folder: 'uploads'
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!)
        }
      );
      streamifier.createReadStream(file.buffer).pipe(upload)
    })
  }

  deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId)
  }

  deleteResources(public_ids:string[]){
    return cloudinary.api.delete_resources(public_ids,{
      resource_type:'image',
      type:'upload',
      invalidate: true
    })
  }
}