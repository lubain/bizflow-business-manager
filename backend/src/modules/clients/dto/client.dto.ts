import { IsString, IsEmail } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Entreprise ABC' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contact@abc.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+261 34 00 000 00' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Rue Principale, Antananarivo' })
  @IsString()
  address: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
