import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.adminRepository.findOne({ where: { email, isActive: true } });
    if (!admin) return null;
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return null;
    return admin;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.buildAuthResponse(admin);
  }

  async register(registerDto: RegisterDto) {
    const exists = await this.adminRepository.findOne({
      where: { email: registerDto.email },
    });
    if (exists) {
      throw new ConflictException('Un administrateur avec cet email existe déjà');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const admin = this.adminRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    await this.adminRepository.save(admin);
    return this.buildAuthResponse(admin);
  }

  async getProfile(adminId: number) {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('Administrateur introuvable');
    const { password, ...result } = admin;
    return result;
  }

  async changePassword(adminId: number, currentPassword: string, newPassword: string) {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    admin.password = await bcrypt.hash(newPassword, 10);
    await this.adminRepository.save(admin);
    return { message: 'Mot de passe modifié avec succès' };
  }

  private buildAuthResponse(admin: Admin) {
    const payload = { sub: admin.id, email: admin.email, role: 'admin' };
    const { password, ...adminWithoutPassword } = admin;
    return {
      access_token: this.jwtService.sign(payload),
      user: adminWithoutPassword,
    };
  }
}
