import {
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 'Ordinateur portable' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ example: 3000000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  clientId: number;

  @ApiProperty({ example: 'Entreprise ABC' })
  @IsString()
  clientName: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Type(() => Number)
  subtotal: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Type(() => Number)
  taxRate: number;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @Type(() => Number)
  taxAmount: number;

  @ApiProperty({ example: 6000000 })
  @IsNumber()
  @Type(() => Number)
  total: number;

  @ApiProperty({ enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
