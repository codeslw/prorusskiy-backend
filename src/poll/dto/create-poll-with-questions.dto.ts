import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber } from 'class-validator';

export class CreatePollWithQuestionsDto {
    @ApiProperty({ description: 'The title of the poll' })
    @IsString()
    title: string;

    @ApiProperty({ 
        description: 'Array of question IDs to include in the poll',
        type: [Number]
    })
    @IsArray()
    @IsNumber({}, { each: true })
    questionIds: number[];
} 