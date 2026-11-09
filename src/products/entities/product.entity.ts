import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
//Entity es una representacion de una tabla

@Entity({ name: 'products' })
export class Product {

  @ApiProperty({
    example:'bcf2c2ff-3db5-46b1-99d9-02ea8e14d52c',
    description:'Product ID',
    uniqueItems:true
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example:"Kamisama's muscle",
    description:'Product Title',
    uniqueItems:true
  })
  @Column('text', {
    unique: true
  })
  title!: string;

  @ApiProperty({
    example:0.0,
    description:'Product Price',
  })
  @Column('float', {
    default: 0
  })
  price!: number;

  @ApiProperty({
    example:"A description for the product",
    description:'Product Description',
  })
  @Column({
    type: 'text',
    nullable: true
  })
  description!: string;

  @ApiProperty({
    example:"kamisamas_muscle",
    description:'Product Slug - for SEO',
    uniqueItems:true
  })
  @Column({
    type: 'text',
    unique: true
  })
  slug!: string;

  @ApiProperty({
    example:10,
    description:'Product Stock',
    default: 0
  })
  @Column({
    type: 'int',
    default: 0
  })
  stock!: number;

  @ApiProperty({
    example:['S', 'M', 'L'],
    description:'Product Sizes'
  })
  @Column({
    type: 'text',
    array: true
  })
  sizes!: string[];

  @ApiProperty({
    example:'men',
    description:'Product Gender'
  })
  @Column({
    type: 'text'
  })
  gender!: string;

  @ApiProperty({
    example:['tag1', 'tag2'],
    description:'Product Tags'
  })
  @Column({
    type: 'text',
    array: true,
    default: []
  })
  tags?: string[];

  @ApiProperty({
    description:'Product Images',
    type: () => [ProductImage],
    required: false
  })
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    {
      cascade: true,
      eager: true
    }
  )
  images?: ProductImage[]

  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true}
  )
  user!: User

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", "")
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    if (!this.slug) {
      this.slug = this.title
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", "")
  }
}
