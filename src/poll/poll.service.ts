import { Injectable } from '@nestjs/common';
import { PollRepository } from './poll.repository';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

@Injectable()
export class PollService {
  constructor(private readonly pollRepository: PollRepository) {}

  async create(createPollDto: CreatePollDto) {
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
}
