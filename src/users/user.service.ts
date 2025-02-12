import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { UserRole, RegistrationStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, role?: UserRole) {
    return await this.prisma.user.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { username: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phoneNumber: { contains: search } }
            ]
          } : {},
          role ? { role } : {}
        ]
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id }
    });
  }

  async registerUser(data: {
    telegramId: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    age: number;
    role: UserRole;
    registrationStatus: RegistrationStatus;
  }) {
    return await this.prisma.user.create({
      data: {
        ...data,
        verificationCode: null,
        verificationExpiry: null
      }
    });
  }

  async checkUsernameAvailability(username: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username }
    });
    return !existingUser;
  }
}