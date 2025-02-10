import { QuestionDifficulty } from "@prisma/client";
import { IsString, IsArray, ValidateNested, IsOptional, IsEnum, IsNumber, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Response DTOs
export class PollResponseDto {
    @ApiProperty({ description: 'Poll ID' })
    id: number;

    @ApiProperty({ description: 'Poll title' })
    title: string;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;
}

export class CreateAnswerDto {
    @ApiProperty({ description: 'The text of the answer' })
    @IsString()
    text: string;

    @ApiPropertyOptional({ description: 'Whether this answer is correct', default: false })
    @IsOptional()
    isCorrect: boolean = false;
}

export class CreateQuestionDto {
    @ApiProperty({ description: 'The text of the question' })
    @IsString()
    text: string;

    @ApiPropertyOptional({ 
        enum: QuestionDifficulty,
        description: 'The difficulty level of the question'
    })
    @IsOptional()
    @IsEnum(QuestionDifficulty)
    difficulty?: QuestionDifficulty;

    @ApiProperty({ 
        type: [CreateAnswerDto],
        description: 'Array of possible answers'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto[];
}

export class QuestionReferenceDto {
    @ApiProperty({ description: 'ID of an existing question' })
    @IsNumber()
    id: number;
}

export class CreatePollDto {
    @ApiProperty({ description: 'The title of the poll' })
    @IsString()
    title: string;

    @ApiProperty({ 
        type: [CreateQuestionDto],
        description: 'Array of new questions to create'
    })
    @ValidateIf(o => !o.existingQuestionIds?.length)
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    newQuestions?: CreateQuestionDto[];

    @ApiProperty({ 
        type: [Number],
        description: 'Array of existing question IDs to include'
    })
    @ValidateIf(o => !o.newQuestions?.length)
    @IsArray()
    @IsNumber({}, { each: true })
    existingQuestionIds?: number[];
}