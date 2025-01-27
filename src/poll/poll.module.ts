import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { PollRepository } from './poll.repository';
import { PrismaService } from '../db/prisma.service';

@Module({
  controllers: [PollController],
  providers: [PollService, PollRepository, PrismaService],
  exports: [PollService],
})
export class PollModule {}
