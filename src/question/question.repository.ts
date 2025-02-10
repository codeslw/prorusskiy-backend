import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionRepository {
    constructor(private readonly prisma: PrismaService) {}

    private readonly defaultInclude = {
        answers: {
            include: {
                answer: true
            }
        }
    };

    async create(data: CreateQuestionDto) {
        return await this.prisma.question.create({
            data: {
                text: data.text,
                difficulty: data.difficulty,
                answers: {
                    create: data.answers.map(answer => ({
                        answer: {
                            create: {
                                text: answer.text,
                                isCorrect: answer.isCorrect
                            }
                        }
                    }))
                }
            },
            include: this.defaultInclude
        });
    }

    async findAll() {
        return await this.prisma.question.findMany({
            include: this.defaultInclude
        });
    }

    async findById(id: number) {
        return await this.prisma.question.findUnique({
            where: { id },
            include: this.defaultInclude
        });
    }

    async update(id: number, data: UpdateQuestionDto) {
        // First delete existing answers
        await this.prisma.questionAnswer.deleteMany({
            where: { questionId: id }
        });

        return await this.prisma.question.update({
            where: { id },
            data: {
                text: data.text,
                difficulty: data.difficulty,
                answers: data.answers ? {
                    create: data.answers.map(answer => ({
                        answer: {
                            create: {
                                text: answer.text,
                                isCorrect: answer.isCorrect
                            }
                        }
                    }))
                } : undefined
            },
            include: this.defaultInclude
        });
    }

    async delete(id: number) {
        // First delete related answers
        await this.prisma.questionAnswer.deleteMany({
            where: { questionId: id }
        });

        return await this.prisma.question.delete({
            where: { id }
        });
    }
} 