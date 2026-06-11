import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private clientRepo: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto, userId: string): Promise<Client> {
    const existing = await this.clientRepo.findOne({
      where: { email: dto.email, userId },
    });
    if (existing) {
      throw new ConflictException('Un client avec cet email existe déjà');
    }

    const client = this.clientRepo.create({
      type: dto.type as 'individual' | 'business',
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      companyName: dto.companyName ?? null,
      email: dto.email,
      phone: dto.phone ?? null,
      siret: dto.siret ?? null,
      vatNumber: dto.vatNumber ?? null,
      street: dto.address?.street ?? null,
      city: dto.address?.city ?? null,
      postalCode: dto.address?.postalCode ?? null,
      country: dto.address?.country ?? 'France',
      notes: dto.notes ?? null,
      userId,
    });
    return this.clientRepo.save(client);
  }

  async findAll(query: ClientQueryDto, userId: string) {
    const { page = 1, limit = 20, search, type } = query;

    const qb = this.clientRepo
      .createQueryBuilder('client')
      .where('client.userId = :userId', { userId });

    if (type) qb.andWhere('client.type = :type', { type });
    if (search) {
      qb.andWhere(
        '(client.firstName ILIKE :s OR client.lastName ILIKE :s OR client.companyName ILIKE :s OR client.email ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('client.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Map address back
    const mapped = data.map((c) => this.mapAddress(c));

    return {
      data: mapped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client introuvable');
    return this.mapAddress(client);
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    userId: string,
  ): Promise<Client> {
    const client = await this.findOne(id, userId);

    if (dto.type !== undefined)
      client.type = dto.type as 'individual' | 'business';
    if (dto.firstName !== undefined) client.firstName = dto.firstName ?? null;
    if (dto.lastName !== undefined) client.lastName = dto.lastName ?? null;
    if (dto.companyName !== undefined)
      client.companyName = dto.companyName ?? null;
    if (dto.email !== undefined) client.email = dto.email;
    if (dto.phone !== undefined) client.phone = dto.phone ?? null;
    if (dto.siret !== undefined) client.siret = dto.siret ?? null;
    if (dto.vatNumber !== undefined) client.vatNumber = dto.vatNumber ?? null;
    if (dto.address?.street !== undefined)
      client.street = dto.address.street ?? null;
    if (dto.address?.city !== undefined) client.city = dto.address.city ?? null;
    if (dto.address?.postalCode !== undefined)
      client.postalCode = dto.address.postalCode ?? null;
    if (dto.address?.country !== undefined)
      client.country = dto.address.country ?? 'France';
    if (dto.notes !== undefined) client.notes = dto.notes ?? null;

    return this.mapAddress(await this.clientRepo.save(client));
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientRepo.remove(client);
  }

  private mapAddress(client: Client): Client & { address: any } {
    return {
      ...client,
      address: {
        street: client.street ?? '',
        city: client.city ?? '',
        postalCode: client.postalCode ?? '',
        country: client.country,
      },
    } as any;
  }
}
