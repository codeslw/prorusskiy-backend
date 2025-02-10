import { ApiProperty } from '@nestjs/swagger';
import { QuestionDifficulty } from '@prisma/client';

export class AnswerResponseDto {
    @ApiProperty({ description: 'Answer ID' })
    id: number;

    @ApiProperty({ description: 'Answer text' })
    text: string;

    @ApiProperty({ description: 'Whether this answer is correct' })
    isCorrect: boolean;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;
}

export class QuestionResponseDto {
    @ApiProperty({ description: 'Question ID' })
    id: number;

    @ApiProperty({ description: 'Question text' })
    text: string;

    @ApiProperty({ 
        enum: QuestionDifficulty,
        description: 'Question difficulty level',
        required: false 
    })
    difficulty?: QuestionDifficulty;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;

    @ApiProperty({ 
        type: [AnswerResponseDto],
        description: 'List of answers for this question'
    })
    answers: AnswerResponseDto[];
} 