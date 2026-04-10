import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['invoices'],
    });
    if (!client) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }
    return client;
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });
    if (existing) {
      throw new ConflictException('Un client avec cet email existe déjà');
    }
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existing = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });
      if (existing) {
        throw new ConflictException('Un client avec cet email existe déjà');
      }
    }

    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async count(): Promise<number> {
    return this.clientRepository.count();
  }
}
