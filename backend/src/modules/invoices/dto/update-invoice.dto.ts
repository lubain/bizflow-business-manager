import { PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { InvoiceStatus } from '../invoice.entity';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: ['draft', 'sent', 'paid', 'cancelled', 'overdue'] })
  @IsEnum(['draft', 'sent', 'paid', 'cancelled', 'overdue'])
  status: InvoiceStatus;
}
