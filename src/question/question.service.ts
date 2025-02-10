import { Injectable } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';

@Injectable()
export class QuestionService {
    constructor(private readonly questionRepository: QuestionRepository) {}

    private mapToResponseDto(question: any): QuestionResponseDto {
        return {
            id: question.id,
            text: question.text,
            difficulty: question.difficulty,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
            answers: question.answers.map(qa => ({
                id: qa.answer.id,
                text: qa.answer.text,
                isCorrect: qa.answer.isCorrect,
                createdAt: qa.answer.createdAt,
                updatedAt: qa.answer.updatedAt
            }))
        };
    }

    async create(createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
        const question = await this.questionRepository.create(createQuestionDto);
        return this.mapToResponseDto(question);
    }

    async findAll(): Promise<QuestionResponseDto[]> {
        const questions = await this.questionRepository.findAll();
        return questions.map(q => this.mapToResponseDto(q));
    }

    async findOne(id: number): Promise<QuestionResponseDto> {
        const question = await this.questionRepository.findById(id);
        return this.mapToResponseDto(question);
    }

    async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<QuestionResponseDto> {
        const question = await this.questionRepository.update(id, updateQuestionDto);
        return this.mapToResponseDto(question);
    }

    async remove(id: number): Promise<QuestionResponseDto> {
        const question = await this.questionRepository.delete(id);
        return this.mapToResponseDto(question);
    }
} 