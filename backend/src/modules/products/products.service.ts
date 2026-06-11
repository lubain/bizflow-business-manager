import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, userId: string): Promise<Product> {
    const exists = await this.productRepo.findOne({
      where: { reference: dto.reference, userId },
    });
    if (exists) throw new ConflictException('Référence déjà utilisée');

    // Cast explicite pour satisfaire TypeORM DeepPartial
    const product = this.productRepo.create({
      reference: dto.reference,
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category as ProductCategory,
      unitPrice: dto.unitPrice,
      purchasePrice: dto.purchasePrice ?? 0,
      vatRate: dto.vatRate ?? 20,
      unit: dto.unit ?? 'unité',
      stockQuantity: dto.stockQuantity ?? 0,
      minStock: dto.minStock ?? 0,
      isService: dto.isService ?? false,
      isActive: true,
      userId,
    });

    return this.productRepo.save(product);
  }

  async findAll(query: ProductQueryDto, userId: string) {
    const { page = 1, limit = 20, search, lowStock, isService } = query;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .where('p.userId = :userId AND p.isActive = true', { userId });

    if (search)
      qb.andWhere('(p.name ILIKE :s OR p.reference ILIKE :s)', {
        s: `%${search}%`,
      });
    if (isService !== undefined)
      qb.andWhere('p.isService = :isService', { isService });

    const [data, total] = await qb
      .orderBy('p.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const filtered = lowStock
      ? data.filter((p) => !p.isService && p.stockQuantity <= p.minStock)
      : data;

    return {
      data: filtered,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<Product> {
    const p = await this.productRepo.findOne({ where: { id, userId } });
    if (!p) throw new NotFoundException('Produit introuvable');
    return p;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    const product = await this.findOne(id, userId);

    // Merge manuellement pour garder les types stricts
    if (dto.reference !== undefined) product.reference = dto.reference;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined)
      product.description = dto.description ?? null;
    if (dto.category !== undefined)
      product.category = dto.category as ProductCategory;
    if (dto.unitPrice !== undefined) product.unitPrice = dto.unitPrice;
    if (dto.purchasePrice !== undefined)
      product.purchasePrice = dto.purchasePrice;
    if (dto.vatRate !== undefined) product.vatRate = dto.vatRate;
    if (dto.unit !== undefined) product.unit = dto.unit;
    if (dto.stockQuantity !== undefined)
      product.stockQuantity = dto.stockQuantity;
    if (dto.minStock !== undefined) product.minStock = dto.minStock;
    if (dto.isService !== undefined) product.isService = dto.isService;

    return this.productRepo.save(product);
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.findOne(id, userId);
    product.isActive = false;
    await this.productRepo.save(product);
  }
}
