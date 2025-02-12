import { Controller, Get, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { UserResponseDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    @ApiQuery({name : 'search', required : false, description : "Search text, finds users by username" })
    @ApiQuery({name : 'role', required : false, description : "Finds users by role" })
    async findAll(
        @Query('search') search?: string,
        @Query('role') role?: UserRole
    ) {
        return this.userService.findAll(search, role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete user (Admin only)' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @Get('telegram/:telegramId')
    @ApiOperation({ summary: 'Get user by Telegram ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findByTelegramId(@Param('telegramId') telegramId: string) {
        return this.userService.findByTelegramId(telegramId);
    }
} 