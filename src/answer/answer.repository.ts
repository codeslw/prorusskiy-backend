import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Answer } from '@prisma/client';

@Injectable()
export class AnswerRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { text: string; isCorrect: boolean; questionId?: number }) {
    const { text, isCorrect, questionId } = data;
    return this.prisma.answer.create({
      data: {
        text,
        isCorrect,
        questions: questionId
          ? {
              create: [
                {
                  question: {
                    connect: { id: questionId },
                  },
                },
              ],
            }
          : undefined,
      },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.answer.findMany({
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.answer.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async update(id: number, data: { text?: string; isCorrect?: boolean }) {
    const { text, isCorrect } = data;
    return this.prisma.answer.update({
      where: { id },
      data: {
        text,
        isCorrect,
      },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    await this.prisma.questionAnswer.deleteMany({
      where: { answerId: id },
    });

    return this.prisma.answer.delete({
      where: { id },
    });
  }

  async addToQuestion(answerId: number, questionId: number) {
    return this.prisma.questionAnswer.create({
      data: {
        answerId,
        questionId,
      },
      include: {
        answer: true,
        question: true,
      },
    });
  }

  async removeFromQuestion(answerId: number, questionId: number) {
    return this.prisma.questionAnswer.delete({
      where: {
        questionId_answerId: {
          answerId,
          questionId,
        },
      },
    });
  }
}