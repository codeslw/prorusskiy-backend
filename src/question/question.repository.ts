import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Question, Answer } from '@prisma/client';

@Injectable()
export class QuestionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { text: string; answers?: { text: string; isCorrect: boolean }[] }) {
    const { text, answers } = data;
    return this.prisma.question.create({
      data: {
        text,
        answers: answers
          ? {
              create: answers.map((answer) => ({
                answer: {
                  create: {
                    text: answer.text,
                    isCorrect: answer.isCorrect,
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        answers: {
          include: {
            answer: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        answers: {
          include: {
            answer: true,
          },
        },
        polls: {
          include: {
            poll: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            answer: true,
          },
        },
        polls: {
          include: {
            poll: true,
          },
        },
      },
    });
  }

  async update(id: number, data: { text?: string; answers?: { text: string; isCorrect: boolean }[] }) {
    const { text, answers } = data;

    if (answers) {
      await this.prisma.questionAnswer.deleteMany({
        where: { questionId: id },
      });
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        text,
        answers: answers
          ? {
              create: answers.map((answer) => ({
                answer: {
                  create: {
                    text: answer.text,
                    isCorrect: answer.isCorrect,
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        answers: {
          include: {
            answer: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    await this.prisma.questionAnswer.deleteMany({
      where: { questionId: id },
    });

    await this.prisma.pollQuestions.deleteMany({
      where: { questionId: id },
    });

    return this.prisma.question.delete({
      where: { id },
    });
  }

  async addAnswers(questionId: number, answers: { text: string; isCorrect: boolean }[]) {
    const createdAnswers = await Promise.all(
      answers.map((answer) =>
        this.prisma.answer.create({
          data: {
            text: answer.text,
            isCorrect: answer.isCorrect,
          },
        })
      )
    );

    await this.prisma.questionAnswer.createMany({
      data: createdAnswers.map((answer) => ({
        questionId,
        answerId: answer.id,
      })),
    });

    return this.findOne(questionId);
  }

  async removeAnswers(questionId: number, answerIds: number[]) {
    await this.prisma.questionAnswer.deleteMany({
      where: {
        questionId,
        answerId: {
          in: answerIds,
        },
      },
    });

    await this.prisma.answer.deleteMany({
      where: {
        id: {
          in: answerIds,
        },
      },
    });

    return this.findOne(questionId);
  }
}