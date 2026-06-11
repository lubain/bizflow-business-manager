// create-expense.dto.ts
import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty() @IsString() title: string;

  @ApiProperty({
    enum: [
      'rent',
      'utilities',
      'salaries',
      'marketing',
      'travel',
      'supplies',
      'equipment',
      'software',
      'insurance',
      'taxes',
      'other',
    ],
  })
  @IsEnum([
    'rent',
    'utilities',
    'salaries',
    'marketing',
    'travel',
    'supplies',
    'equipment',
    'software',
    'insurance',
    'taxes',
    'other',
  ])
  category: string;

  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) vatAmount?: number;
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() supplier?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
