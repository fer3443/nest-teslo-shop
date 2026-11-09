import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/mock';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly producstService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ) { }
  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts(adminUser)
    return 'SEED EXECUTED'
  }

  private async insertUsers(){
    const seedUsers = initialData.users;
    const users:User[] = [];
    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    })
    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user:User) {
    await this.producstService.deleteAllProductsSeed();
    const products = initialData.products;
    await this.producstService.createBulkProductsSeed(products, user)
    return true
  }

  private async deleteTables(){
    await this.producstService.deleteAllProductsSeed();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where("").execute();
  }
}
