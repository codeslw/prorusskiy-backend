import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Matches } from 'class-validator';
import { UserRole, RegistrationStatus } from '@prisma/client';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    phoneNumber: string;

    @ApiProperty()
    age: number;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiProperty({ enum: RegistrationStatus })
    registrationStatus: RegistrationStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Matches(/^\+[1-9]\d{10,14}$/)
    phoneNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    age?: number;

    @ApiProperty({ enum: UserRole, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
} 