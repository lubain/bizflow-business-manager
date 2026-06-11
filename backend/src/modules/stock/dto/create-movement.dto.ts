import {
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovementDto {
  @ApiProperty() @IsUUID() productId: string;

  @ApiProperty({ enum: ['in', 'out', 'adjustment', 'return'] })
  @IsEnum(['in', 'out', 'adjustment', 'return'])
  type: 'in' | 'out' | 'adjustment' | 'return';

  @ApiProperty() @IsNumber() @Min(0.001) quantity: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}
