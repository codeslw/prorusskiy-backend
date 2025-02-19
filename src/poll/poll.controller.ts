import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto, PollResponseDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Poll, Question, Answer } from '@prisma/client';
import { CreatePollWithQuestionsDto } from './dto/create-poll-with-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@ApiTags('Polls')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new poll' })
  @ApiResponse({ status: 201, description: 'Poll has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body(new ValidationPipe()) createPollDto: CreatePollDto) {
    return await this.pollService.create(createPollDto);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get()
  @ApiOperation({ summary: 'Get all polls' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for polls' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'size', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Return all polls.', type: () => [PollResponseDto] })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    if (search || page || size) {
      return await this.pollService.findWithFilters(
        search,
        page ? parseInt(page) : undefined,
        size ? parseInt(size) : undefined,
      );
    }
    return await this.pollService.findAll();
  }


  @Get('paged')
  @ApiOperation({ summary: 'Get all polls paginated' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number' })
  @ApiQuery({ name: 'size', required: true, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Return all polls paginated.' })
  async findAllPaginated(
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return await this.pollService.findAllPaginated(parseInt(page), parseInt(size));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a poll by id' })
  @ApiResponse({ status: 200, description: 'Return a poll.' })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  async findOne(@Param('id') id: string) {
    return await this.pollService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a poll' })
  @ApiResponse({ status: 200, description: 'Poll has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePollDto: UpdatePollDto,
  ) {
    return await this.pollService.update(+id, updatePollDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a poll' })
  @ApiResponse({ status: 200, description: 'Poll has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  async remove(@Param('id') id: string) {
    return await this.pollService.remove(+id);
  }

  @Post('with-questions')
  @ApiOperation({ summary: 'Create a new poll with existing questions' })
  @ApiResponse({ status: 201, description: 'Poll has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'One or more questions not found.' })
  async createWithExistingQuestions(
    @Body(new ValidationPipe()) createPollDto: CreatePollWithQuestionsDto
  ) {
    return await this.pollService.createWithExistingQuestions(createPollDto);
  }
}
