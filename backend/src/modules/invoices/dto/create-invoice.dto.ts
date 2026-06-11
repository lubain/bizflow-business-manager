import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceLineDto {
  @ApiPropertyOptional() @IsUUID() @IsOptional() productId?: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Min(0.01) quantity: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;
  @ApiProperty({ default: 20 }) @IsNumber() @Min(0) @Max(100) vatRate: number;
  @ApiProperty({ default: 0 }) @IsNumber() @Min(0) @Max(100) discount: number;
}

export class CreateInvoiceDto {
  @ApiProperty() @IsUUID() clientId: string;
  @ApiProperty() @IsDateString() issueDate: string;
  @ApiProperty() @IsDateString() dueDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTerms?: number;

  @ApiProperty({ type: [InvoiceLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];
}
