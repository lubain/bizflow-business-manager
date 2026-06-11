import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une facture' })
  create(@Body() dto: CreateInvoiceDto, @Request() req: any) {
    return this.invoicesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les factures avec pagination et filtres' })
  findAll(@Query() query: InvoiceQueryDto, @Request() req: any) {
    return this.invoicesService.findAll(query, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.invoicesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
    @Request() req: any,
  ) {
    return this.invoicesService.update(id, dto, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Changer le statut d'une facture" })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @Request() req: any,
  ) {
    return this.invoicesService.updateStatus(id, dto.status, req.user.id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Dupliquer une facture' })
  duplicate(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.invoicesService.duplicate(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.invoicesService.remove(id, req.user.id);
  }
}
