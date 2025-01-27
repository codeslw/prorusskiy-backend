import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { CreatePollDto } from "./dto/create-poll.dto";
import { UpdatePollDto } from "./dto/update-poll.dto";

@Injectable()
export class PollRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly defaultInclude = {
        questions: {
            include: {
                question: {
                    include: {
                        answers: {
                            include: {
                                answer: true
                            }
                        }
                    }
                }
            }
        }
    };

    async findAll() {
        return await this.prisma.poll.findMany({
            include: this.defaultInclude
        });
    }

    async findAllPaginated(page: number, size: number) {
        return await this.prisma.poll.findMany({
            include: this.defaultInclude,
            skip: (page - 1) * size,
            take: size,
        });
    }

    async findById(id: number) {
        return await this.prisma.poll.findUnique({
            where: { id },
            include: this.defaultInclude
        });
    }

    async findBySearch(search: string) {
        return await this.prisma.poll.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: search
                        }
                    },
                    {
                        questions: {
                            some: {
                                question: {
                                    text: {
                                        contains: search
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            include: this.defaultInclude
        });
    }
    
    async findWithFilters(search?: string, page?: number, size?: number) {
        return await this.prisma.poll.findMany({
            where: {
                OR: search ? [
                    {
                        title: {
                            contains: search
                        }
                    },
                    {
                        questions: {
                            some: {
                                question: {
                                    text: {
                                        contains: search
                                    }
                                }
                            }
                        }
                    }
                ] : undefined
            },
            include: this.defaultInclude,
            skip: page ? (page - 1) * size : undefined,
            take: size ? size : undefined,
        });
    }

    async create(data: CreatePollDto) {
        return await this.prisma.poll.create({
            data: {
                title: data.title,
                questions: {
                    create: data.questions.map(q => ({
                        question: {
                            create: {
                                text: q.text,
                                diffuculty: q.difficulty,
                                answers: {
                                    create: q.answers.map(a => ({
                                        answer: {
                                            create: {
                                                text: a.text,
                                                isCorrect: a.isCorrect
                                            }
                                        }
                                    }))
                                }
                            }
                        }
                    }))
                }
            },
            include: this.defaultInclude
        });
    }

    async update(id: number, data: UpdatePollDto) {
        const updateData: any = {
            title: data.title,
            updatedAt: new Date()
        };

        if (data.questions) {
            // Delete existing questions and their answers
            const poll = await this.findById(id);
            if (poll) {
                for (const pollQuestion of poll.questions) {
                    await this.prisma.questionAnswer.deleteMany({
                        where: { questionId: pollQuestion.questionId }
                    });
                }
                await this.prisma.pollQuestions.deleteMany({
                    where: { pollId: id }
                });
            }

            // Create new questions and answers
            updateData.questions = {
                create: data.questions.map(q => ({
                    question: {
                        create: {
                            text: q.text,
                            diffuculty: q.difficulty,
                            answers: {
                                create: q.answers.map(a => ({
                                    answer: {
                                        create: {
                                            text: a.text,
                                            isCorrect: a.isCorrect
                                        }
                                    }
                                }))
                            }
                        }
                    }
                }))
            };
        }

        return await this.prisma.poll.update({
            where: { id },
            data: updateData,
            include: this.defaultInclude
        });
    }

    async delete(id: number) {
        // First delete all related questions and answers
        const poll = await this.findById(id);
        if (!poll) return null;

        // Delete related questions and their answers
        for (const pollQuestion of poll.questions) {
            await this.prisma.questionAnswer.deleteMany({
                where: {
                    questionId: pollQuestion.questionId
                }
            });
        }

        // Delete poll questions relations
        await this.prisma.pollQuestions.deleteMany({
            where: {
                pollId: id
            }
        });

        // Finally delete the poll
        return await this.prisma.poll.delete({
            where: { id }
        });
    }
}