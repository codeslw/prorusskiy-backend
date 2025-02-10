import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class AnswerResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    text: string;

    @ApiProperty()
    isCorrect: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CreateAnswerDto {
    @ApiProperty({ description: 'The text of the answer' })
    @IsString()
    text: string;

    @ApiProperty({ description: 'Whether this answer is correct' })
    @IsBoolean()
    isCorrect: boolean;
} 