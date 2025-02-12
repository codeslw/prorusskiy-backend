import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class AdminLoginDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'admin123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class StudentVerificationRequestDto {
    @ApiProperty({ example: '123456789' })
    @IsString()
    telegramId: string;

    @ApiProperty({ example: '+998940992774' })
    @IsString()
    @Matches(/^\+[1-9]\d{10,14}$/, { message: 'Phone number must be in international format' })
    phoneNumber: string;
}

export class StudentVerificationDto {
    @ApiProperty({ example: 'student1' })
    @IsString()
    username: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @MinLength(6)
    verificationCode: string;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    user: {
        id: string;
        username: string;
        role: string;
    };
} 