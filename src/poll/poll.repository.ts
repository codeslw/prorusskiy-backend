import { Injectable } from "@nestjs/common";
import { Poll } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class PollRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return await this.prisma.poll.findMany();
    }

    async findAllPaginated(page: number, size: number) {
        return await this.prisma.poll.findMany({
            skip: (page - 1) * size,
            take: size,
        })
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
        })
    }
    
    async findWithFilters(search?: string, page?: number, size?: number) {
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
            skip: page ?  (page - 1) * size : undefined,
            take: size ? size: undefined,
        })
    }

    async create(data : Poll) {
        return await this.prisma.poll.create({
            data: {
                ...data,
            }
        })
    }

    async update(id: number, data: Omit<Poll, "id">) {
        return await this.prisma.poll.update({
            where: {
                id
            },
            data
        })
    }

    async delete(id: number) {
        return await this.prisma.poll.delete({
            where: {
                id
            }
        })
    }

}