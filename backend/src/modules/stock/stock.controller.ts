// ──── stock.controller.ts ────────────────────
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StockService } from './stock.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class MovementQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;
}

@ApiTags('stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movements')
  @ApiOperation({ summary: 'Enregistrer un mouvement de stock' })
  createMovement(@Body() dto: CreateMovementDto, @Request() req: any) {
    return this.stockService.createMovement(dto, req.user.id);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Historique des mouvements' })
  findMovements(@Query() query: MovementQueryDto, @Request() req: any) {
    return this.stockService.findMovements(
      req.user.id,
      query.productId,
      query.page,
      query.limit,
    );
  }

  @Get('value')
  @ApiOperation({ summary: 'Valeur totale du stock' })
  getStockValue(@Request() req: any) {
    return this.stockService.getStockValue(req.user.id);
  }
}
