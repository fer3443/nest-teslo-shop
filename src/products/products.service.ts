import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage, Product } from './entities';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger();
  //uso el patron repositorio
  constructor(
    //inyecto el repo y la entidad
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,

  ) { }
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...rest } = createProductDto;
      const product = this.productRepository.create({
        ...rest,
        user,
        images: images.map(image => this.productImageRepository.create({ url:image.secure_url, public_id:image.public_id }))
      });//en esta parte solo crea la instancia del prod
      await this.productRepository.save(product);//? aqui grabo el producto e impacto la db
      return product;
    } catch (error) {
      this.handleExcepctions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
  }

  async findOne(term: string) {

    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({ slug:term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      //TODO: si voy a buscar por titulo deberia agregar un index.
      product = await queryBuilder
        .where('LOWER(title)= :title or slug= :slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    };

    if (!product) {
      throw new NotFoundException(`No se encontró el producto con id: ${term}`)
    }
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {

    const { images, ...toUpdate } = updateProductDto
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    })

    if (!product) {
      throw new NotFoundException(`El producto con id ${id} no encontrado`)
    }

    //create query runner (lo que seria un transaction)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //si vienen imagenes en el update, borro TODAS las anteriores para insertar las nuevas
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(
          image => this.productImageRepository.create({ url: image.secure_url, public_id:image.public_id })
        )
      } else {
        product.images = await this.productImageRepository.findBy({ product: { id } })
      }

      product.user = user
      await queryRunner.manager.save(product)//salvo el producto pero no está guardado
      await queryRunner.commitTransaction(); //aqui si guardo el prod en la db

      return product
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleExcepctions(error)
    } finally {
      await queryRunner.release();//cierro la conexión siempre
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id)
      await this.productRepository.delete({ id })
    } catch (error) {
      this.handleExcepctions(error)
    }
  }

  private handleExcepctions(error: unknown) {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string; detail?: string }
      if (driverError.code === '23505') {
        throw new BadRequestException(driverError.detail)
      }
      if (driverError.code === '23503') {
        throw new BadRequestException(driverError.detail)
      }
    }
    this.logger.error('Error inesperado revise los logs')
    throw new InternalServerErrorException(`Ayuda ${error}`)
  };

  async deleteAllProductsSeed() {
    const env = this.configService.get<string>('NODE_ENV');
    if (env !== 'develop') {
      throw new ForbiddenException('Esta operacion no está permitida en producción')
    }
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where("")
        .execute()
    } catch (error) {
      this.handleExcepctions(error)
    }
  }

  async createBulkProductsSeed(createProductDto: CreateProductDto[], user:User) {
    try {
      const products = createProductDto.map((product) => {
        const { images, ...rest } = product
        return this.productRepository.create({
          ...rest,
          user,
          images: images?.map(image => this.productImageRepository.create({ url: image.secure_url, public_id:image.public_id }))
        })
      })
      await this.productRepository.save(products)
      return products;
    } catch (error) {
      this.handleExcepctions(error)
    }
  }
}
