import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
}

export class CreateClientDto {
  @ApiProperty({ enum: ['individual', 'business'] })
  @IsEnum(['individual', 'business'])
  type: 'individual' | 'business';

  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;

  @ApiProperty() @IsEmail() email: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() siret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vatNumber?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
