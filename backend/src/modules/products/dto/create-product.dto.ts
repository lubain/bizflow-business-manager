// create-product.dto.ts
import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsString() reference: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiProperty({
    enum: [
      'electronics',
      'clothing',
      'food',
      'services',
      'software',
      'office',
      'other',
    ],
  })
  @IsEnum([
    'electronics',
    'clothing',
    'food',
    'services',
    'software',
    'office',
    'other',
  ])
  category: string;

  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;
  @ApiPropertyOptional({ default: 'unité' })
  @IsOptional()
  @IsString()
  unit?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isService?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
