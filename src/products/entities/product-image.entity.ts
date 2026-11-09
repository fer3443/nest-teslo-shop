import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "./product.entity";

@Entity({name:'product_images'})
export class ProductImage {
  @ApiProperty({
    example:'bcf2c2ff-3db5-46b1-99d9-02ea8e14d52c',
    description:'Image ID',
    type: String
  })
  @PrimaryGeneratedColumn('uuid')
  id!:number;

  @ApiProperty({
    example:'https://res.cloudinary.com/demo/image/upload/v1/uploads/abc123.jpg',
    description:'Image URL'
  })
  @Column('text')
  url!:string;

  @ApiProperty({
    example:'uploads/abc123',
    description:'Cloudinary public id'
  })
  @Column('text')
  public_id!:string;

  @ManyToOne(
    () => Product,
    (product) => product.images,
    { onDelete: 'CASCADE'}
  )
  product!:Product
}
