import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
  @ApiProperty({
    example: 'bcf2c2ff-3db5-46b1-99d9-02ea8e14d52c',
    description: 'User ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    uniqueItems: true
  })
  @Column('text', {
    unique: true
  })
  email!: string;

  @Column('text', {
    select: false
  })
  password!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name'
  })
  @Column('text')
  fullName!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    default: true
  })
  @Column('bool', {
    default: true
  })
  isActive!: boolean;

  @ApiProperty({
    example: ['user'],
    description: 'User roles',
    default: ['user']
  })
  @Column('text',
    {
      array: true,
      default: ['user']
    }
  )
  roles!: string[];

  @OneToMany(
    () => Product,
    (product) => product.user,
  )
  product!: Product

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim()
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim()
  }
}
