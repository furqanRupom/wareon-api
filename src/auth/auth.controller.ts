import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateUserDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import type { AuthRequest } from './types/auth-request.types';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        const result = await this.authService.registerUser(dto);
        return {
            success: true,
            message: 'User registered successfully',
            data: result
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() dto: CreateUserDto) {
        const result = await this.authService.loginUser(dto);
        return {
            success: true,
            message: 'User logged in successfully',
            data: result
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('me')
    async profile(@Req() req: AuthRequest) {
        const result = await this.authService.profile(req.user.id);
        return {
            success: true,
            message: 'User profile retrieved successfully',
            data: result
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put('profile/:id')
    async updateProfile(@Req() req: AuthRequest, @Body() updateData: Partial<CreateUserDto>) {
        const result = await this.authService.updateProfile(req.user.id, updateData);
        return {
            success: true,
            message: 'User profile updated successfully',
            data: result
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put('change-password')
    async changePassword(@Req() req: AuthRequest, @Body() dto: ChangePasswordDto) {
        const result = await this.authService.changePassword(req.user.id, dto);
        return {
            success: true,
            message: 'User password changed successfully',
            data: result
        }
    }

}
