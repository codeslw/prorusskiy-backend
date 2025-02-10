import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionResponseDto } from './dto/question-response.dto';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new question' })
    @ApiResponse({ 
        status: 201, 
        description: 'The question has been successfully created.',
        type: QuestionResponseDto 
    })
    create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
        return   this.questionService.create(createQuestionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all questions' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all questions',
        type: [QuestionResponseDto] 
    })
    findAll(): Promise<QuestionResponseDto[]> {
        return this.questionService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a question by id' })
    @ApiResponse({ 
        status: 200, 
        description: 'The found question',
        type: QuestionResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Question not found' })
    findOne(@Param('id') id: string): Promise<QuestionResponseDto> {
        return this.questionService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a question' })
    @ApiResponse({ 
        status: 200, 
        description: 'The question has been successfully updated.',
        type: QuestionResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Question not found' })
    update(
        @Param('id') id: string, 
        @Body() updateQuestionDto: UpdateQuestionDto
    ): Promise<QuestionResponseDto> {
        return this.questionService.update(+id, updateQuestionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a question' })
    @ApiResponse({ 
        status: 200, 
        description: 'The question has been successfully deleted.',
        type: QuestionResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Question not found' })
    remove(@Param('id') id: string): Promise<QuestionResponseDto> {
        return this.questionService.remove(+id);
    }
} 