import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { QuestionRepository } from './question.repository';
import { PrismaService } from '../db/prisma.service';

@Module({
    controllers: [QuestionController],
    providers: [QuestionService, QuestionRepository, PrismaService],
    exports: [QuestionService]
})
export class QuestionModule {} 