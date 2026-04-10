import { IsString, IsNumber, IsPositive, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Achat fournitures bureau' })
  @IsString()
  description: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Fournitures' })
  @IsString()
  category: string;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
