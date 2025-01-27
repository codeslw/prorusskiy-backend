import { PartialType } from '@nestjs/mapped-types';
import { CreatePollDto, CreateQuestionDto, CreateAnswerDto } from './create-poll.dto';

export class UpdateAnswerDto extends PartialType(CreateAnswerDto) {}
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
export class UpdatePollDto extends PartialType(CreatePollDto) {}