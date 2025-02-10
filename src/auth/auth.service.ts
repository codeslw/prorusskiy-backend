import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../db/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AdminLoginDto, StudentVerificationRequestDto, StudentVerificationDto } from './dto/auth.dto';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  async adminLogin(loginDto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = this.hashPassword(loginDto.password);
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async requestVerification(dto: StudentVerificationRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });

    if (!user || user.role !== 'STUDENT') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const verificationCode = Math.random().toString().slice(-6);
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpiry
      }
    });

    // TODO: Integrate with SMS service to send verification code
    // await smsService.send(dto.phoneNumber, `Your verification code is: ${verificationCode}`);

    return { message: 'Verification code sent to your phone number' };
  }

  async verifyStudent(dto: StudentVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });

    if (!user || user.role !== 'STUDENT') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verificationCode || 
      user.verificationCode !== dto.verificationCode ||
      user.verificationExpiry < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Clear verification code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: null,
        verificationExpiry: null
      }
    });

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload: JwtPayload = { 
      sub: user.id,
      username: user.username,
      role: user.role
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }
} 