import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async registerUser(data: {
    telegramId: string,
    username: string,
    firstName: string,
    lastName: string,
    age: number
  }) {
    try {

        console.log(data, "registration data");
      return await this.prisma.user.create({
        data: {
          telegramId: data.telegramId,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          registrationStatus: 'COMPLETED'
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async checkUsernameAvailability(username: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username }
    });
    return !existingUser;
  }
}