import { Injectable } from '@nestjs/common';
import { Poll } from '@prisma/client';

@Injectable()
export class PollService {
  create(createPollDto: Poll) {
    return 'This action adds a new poll';
  }

  findAll() {
    return `This action returns all poll`;
  }

  findOne(id: number) {
    return `This action returns a #${id} poll`;
  }

  update(id: number, updatePollDto: Omit<Poll, "id">) {
    return `This action updates a #${id} poll`;
  }

  remove(id: number) {
    return `This action removes a #${id} poll`;
  }
}
