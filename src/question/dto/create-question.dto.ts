import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty } from '@prisma/client';
import { CreateAnswerDto } from '../../answer/dto/create-answer.dto';

export class QuestionResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    text: string;

    @ApiProperty({ enum: QuestionDifficulty })
    difficulty: QuestionDifficulty;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
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

    @ApiProperty({ type: [CreateAnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto[];
} 