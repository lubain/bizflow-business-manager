import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['client', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['client', 'items'],
    });
    if (!invoice) {
      throw new NotFoundException(`Facture #${id} introuvable`);
    }
    return invoice;
  }

  async findByClient(clientId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { clientId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { items, ...invoiceData } = createInvoiceDto;
    const invoice = this.invoiceRepository.create(invoiceData);
    invoice.items = items.map((item) =>
      this.invoiceItemRepository.create(item),
    );
    return this.invoiceRepository.save(invoice);
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    const { items, ...invoiceData } = updateInvoiceDto;

    Object.assign(invoice, invoiceData);

    if (items) {
      await this.invoiceItemRepository.delete({ invoiceId: id });
      invoice.items = items.map((item) =>
        this.invoiceItemRepository.create({ ...item, invoiceId: id }),
      );
    }

    return this.invoiceRepository.save(invoice);
  }

  async markAsPaid(id: number): Promise<Invoice> {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('La facture est déjà marquée comme payée');
    }
    invoice.status = InvoiceStatus.PAID;
    return this.invoiceRepository.save(invoice);
  }

  async updateOverdueInvoices(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.invoiceRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: InvoiceStatus.LATE })
      .where('status = :status', { status: InvoiceStatus.PENDING })
      .andWhere('dueDate < :today', { today })
      .execute();
    return result.affected || 0;
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getPendingRevenue(): Promise<number> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status IN (:...statuses)', {
        statuses: [InvoiceStatus.PENDING, InvoiceStatus.LATE],
      })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getMonthlyRevenue(): Promise<{ month: string; total: number }[]> {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .select("TO_CHAR(invoice.issueDate, 'YYYY-MM')", 'month')
      .addSelect('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere("invoice.issueDate >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(invoice.issueDate, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async countByStatus(): Promise<Record<InvoiceStatus, number>> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('invoice.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('invoice.status')
      .getRawMany();

    const counts: Record<string, number> = {
      [InvoiceStatus.PAID]: 0,
      [InvoiceStatus.PENDING]: 0,
      [InvoiceStatus.LATE]: 0,
    };
    result.forEach((r) => {
      counts[r.status] = parseInt(r.count, 10);
    });
    return counts as Record<InvoiceStatus, number>;
  }
}
