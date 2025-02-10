import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminLoginDto, StudentVerificationRequestDto, StudentVerificationDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('admin/login')
    @ApiOperation({ summary: 'Admin login with username and password' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async adminLogin(@Body() loginDto: AdminLoginDto) {
        return await this.authService.adminLogin(loginDto);
    }

    @Post('student/request-verification')
    @ApiOperation({ summary: 'Request verification code for student' })
    @ApiResponse({ status: 200, description: 'Verification code sent' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async requestVerification(@Body() dto: StudentVerificationRequestDto) {
        return await this.authService.requestVerification(dto);
    }

    @Post('student/verify')
    @ApiOperation({ summary: 'Verify student with code' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async verifyStudent(@Body() dto: StudentVerificationDto) {
        return await this.authService.verifyStudent(dto);
    }
} 