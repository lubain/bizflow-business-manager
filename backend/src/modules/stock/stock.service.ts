import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { Product } from '../products/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async createMovement(
    dto: CreateMovementDto,
    userId: string,
  ): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: dto.productId, userId },
      });
      if (!product) throw new NotFoundException('Produit introuvable');
      if (product.isService)
        throw new BadRequestException(
          "Impossible de gérer le stock d'un service",
        );

      // Calculate new stock
      let newQty = Number(product.stockQuantity);
      switch (dto.type) {
        case 'in':
        case 'return':
          newQty += Number(dto.quantity);
          break;
        case 'out':
          if (newQty < Number(dto.quantity)) {
            throw new BadRequestException(
              `Stock insuffisant. Disponible: ${newQty} ${product.unit}`,
            );
          }
          newQty -= Number(dto.quantity);
          break;
        case 'adjustment':
          newQty = Number(dto.quantity); // absolute value
          break;
      }

      // Update product stock
      product.stockQuantity = newQty;
      await manager.save(Product, product);

      // Record movement
      const movement = manager.create(StockMovement, { ...dto, userId });
      return manager.save(StockMovement, movement);
    });
  }

  async findMovements(
    userId: string,
    productId?: string,
    page = 1,
    limit = 50,
  ) {
    const qb = this.movementRepo
      .createQueryBuilder('mv')
      .leftJoinAndSelect('mv.product', 'product')
      .where('mv.userId = :userId', { userId });

    if (productId) qb.andWhere('mv.productId = :productId', { productId });

    const [data, total] = await qb
      .orderBy('mv.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStockValue(userId: string) {
    const products = await this.productRepo.find({
      where: { userId, isActive: true, isService: false },
    });
    const totalValue = products.reduce(
      (s, p) => s + Number(p.stockQuantity) * Number(p.purchasePrice),
      0,
    );
    const lowStockCount = products.filter(
      (p) => p.stockQuantity <= p.minStock,
    ).length;
    return {
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockCount,
      productsCount: products.length,
    };
  }
}
