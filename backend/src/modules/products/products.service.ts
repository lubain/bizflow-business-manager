import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product;
  }

  async findLowStock(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async updateStock(
    id: number,
    updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const newStock = Number(product.stock) + updateStockDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuffisant. Stock actuel: ${product.stock}`,
      );
    }

    product.stock = newStock;
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async count(): Promise<number> {
    return this.productRepository.count();
  }

  async countLowStock(): Promise<number> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .getCount();
  }
}
