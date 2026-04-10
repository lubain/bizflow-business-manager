import { IsString, IsNumber, IsPositive, IsInt, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Ordinateur portable' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStock: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateStockDto {
  @ApiProperty({
    example: 5,
    description: 'Quantité à ajouter (positif) ou retirer (négatif)',
  })
  @IsInt()
  @Type(() => Number)
  quantity: number;
}
