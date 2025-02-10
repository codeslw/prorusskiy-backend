import { Injectable } from '@nestjs/common';
import { PollRepository } from './poll.repository';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { CreatePollWithQuestionsDto } from './dto/create-poll-with-questions.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class PollService {
  constructor(private readonly pollRepository: PollRepository) {}

  async create(createPollDto: CreatePollDto) {
    if (!createPollDto.newQuestions?.length && !createPollDto.existingQuestionIds?.length) {
        throw new BadRequestException('At least one question (new or existing) must be provided');
    }

    if (createPollDto.existingQuestionIds?.length) {
        const questions = await this.pollRepository.findQuestionsByIds(createPollDto.existingQuestionIds);
        if (questions.length !== createPollDto.existingQuestionIds.length) {
            throw new NotFoundException('One or more questions not found');
        }
    }

    return await this.pollRepository.create(createPollDto);
  }

  async findOne(id: number) {
    return await this.pollRepository.findById(id);
  }

  async findAll() {
    return await this.pollRepository.findAll();
  }

  async findAllPaginated(page: number, size: number) {
    return await this.pollRepository.findAllPaginated(page, size);
  }

  async findWithFilters(search?: string, page?: number, size?: number) {
    return await this.pollRepository.findWithFilters(search, page, size);
  }

  async update(id: number, updatePollDto: UpdatePollDto) {
    return await this.pollRepository.update(id, updatePollDto);
  }

  async remove(id: number) {
    return await this.pollRepository.delete(id);
  }

  async createWithExistingQuestions(createPollDto: CreatePollWithQuestionsDto) {
    // Verify all questions exist
    const questions = await this.pollRepository.findQuestionsByIds(createPollDto.questionIds);

    if (questions.length !== createPollDto.questionIds.length) {
      throw new NotFoundException('One or more questions not found');
    }

    return await this.pollRepository.createWithExistingQuestions(createPollDto);
  }
}
