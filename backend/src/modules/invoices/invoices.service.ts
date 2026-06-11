import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Invoice, InvoiceLine, InvoiceStatus } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceLine) private lineRepo: Repository<InvoiceLine>,
    private dataSource: DataSource,
  ) {}

  // ─── Numérotation automatique ─────────────────
  private async generateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.invoiceRepo
      .createQueryBuilder('i')
      .where('i.number LIKE :pattern', { pattern: `FAC-${year}-%` })
      .orderBy('i.createdAt', 'DESC')
      .getOne();

    let seq = 1;
    if (last) {
      const parts = last.number.split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `FAC-${year}-${String(seq).padStart(4, '0')}`;
  }

  // ─── Calcul d'une ligne ───────────────────────
  private buildLine(
    manager: any,
    dto: {
      description: string;
      quantity: number;
      unitPrice: number;
      vatRate: number;
      discount: number;
      productId?: string;
    },
    invoiceId?: string,
  ): InvoiceLine {
    const totalHT = dto.quantity * dto.unitPrice * (1 - dto.discount / 100);
    const totalTTC = totalHT * (1 + dto.vatRate / 100);
    return manager.create(InvoiceLine, {
      productId: dto.productId ?? null,
      description: dto.description,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      vatRate: dto.vatRate,
      discount: dto.discount,
      totalHT,
      totalTTC,
      ...(invoiceId ? { invoiceId } : {}),
    });
  }

  // ─── Créer ────────────────────────────────────
  async create(dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    return this.dataSource.transaction(async (manager) => {
      const number = await this.generateNumber();

      // Créer l'invoice sans les lignes d'abord
      const invoice = manager.create(Invoice, {
        number,
        clientId: dto.clientId,
        issueDate: dto.issueDate,
        dueDate: dto.dueDate,
        paymentTerms: dto.paymentTerms ?? 30,
        notes: dto.notes ?? null,
        userId,
        status: 'draft' as InvoiceStatus,
        subtotalHT: 0,
        totalVAT: 0,
        totalTTC: 0,
        totalDiscount: 0,
      });

      const savedInvoice = await manager.save(Invoice, invoice);

      // Créer les lignes avec l'invoiceId
      const lines = dto.lines.map((l) =>
        this.buildLine(manager, l, savedInvoice.id),
      );
      savedInvoice.lines = await manager.save(InvoiceLine, lines);

      // Recalculer les totaux
      savedInvoice.calculateTotals();
      return manager.save(Invoice, savedInvoice);
    });
  }

  // ─── Lister avec filtres ──────────────────────
  async findAll(query: InvoiceQueryDto, userId: string) {
    const { page = 1, limit = 15, search, status, clientId } = query;

    // Auto-marquer les factures en retard
    await this.invoiceRepo
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: 'overdue' })
      .where('status = :s AND "dueDate" < :d AND "userId" = :u', {
        s: 'sent',
        d: new Date().toISOString().split('T')[0],
        u: userId,
      })
      .execute();

    const qb = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.lines', 'lines')
      .where('invoice.userId = :userId', { userId });

    if (status && status !== 'all')
      qb.andWhere('invoice.status = :status', { status });
    if (clientId) qb.andWhere('invoice.clientId = :clientId', { clientId });
    if (search) {
      qb.andWhere(
        '(invoice.number ILIKE :s OR client.firstName ILIKE :s OR client.lastName ILIKE :s OR client.companyName ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('invoice.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Trouver une facture ──────────────────────
  async findOne(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, userId },
      relations: ['client', 'lines'],
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }

  // ─── Modifier ─────────────────────────────────
  async update(
    id: string,
    dto: UpdateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    return this.dataSource.transaction(async (manager) => {
      const invoice = await this.findOne(id, userId);

      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        throw new BadRequestException(
          'Impossible de modifier une facture payée ou annulée',
        );
      }

      // Supprimer les lignes existantes puis recréer
      if (dto.lines) {
        await manager.delete(InvoiceLine, { invoiceId: id });
        const lines = dto.lines.map((l) => this.buildLine(manager, l, id));
        invoice.lines = await manager.save(InvoiceLine, lines);
      }

      if (dto.clientId) invoice.clientId = dto.clientId;
      if (dto.issueDate) invoice.issueDate = dto.issueDate;
      if (dto.dueDate) invoice.dueDate = dto.dueDate;
      if (dto.paymentTerms !== undefined)
        invoice.paymentTerms = dto.paymentTerms;
      if (dto.notes !== undefined) invoice.notes = dto.notes ?? null;

      invoice.calculateTotals();
      return manager.save(Invoice, invoice);
    });
  }

  // ─── Changer le statut ────────────────────────
  async updateStatus(
    id: string,
    status: InvoiceStatus,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, userId);

    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['paid', 'cancelled', 'overdue'],
      overdue: ['paid', 'cancelled'],
      paid: [],
      cancelled: [],
    };

    if (!validTransitions[invoice.status].includes(status)) {
      throw new BadRequestException(
        `Transition invalide : ${invoice.status} → ${status}`,
      );
    }

    invoice.status = status;
    if (status === 'paid')
      invoice.paymentDate = new Date().toISOString().split('T')[0];
    return this.invoiceRepo.save(invoice);
  }

  // ─── Dupliquer ────────────────────────────────
  async duplicate(id: string, userId: string): Promise<Invoice> {
    const original = await this.findOne(id, userId);
    return this.create(
      {
        clientId: original.clientId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + original.paymentTerms * 86400000)
          .toISOString()
          .split('T')[0],
        paymentTerms: original.paymentTerms,
        notes: original.notes ?? undefined,
        lines: original.lines.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          vatRate: Number(l.vatRate),
          discount: Number(l.discount),
          productId: l.productId ?? undefined,
        })),
      },
      userId,
    );
  }

  // ─── Supprimer ────────────────────────────────
  async remove(id: string, userId: string): Promise<void> {
    const invoice = await this.findOne(id, userId);
    if (invoice.status !== 'draft') {
      throw new BadRequestException(
        'Seuls les brouillons peuvent être supprimés',
      );
    }
    await this.invoiceRepo.remove(invoice);
  }
}
