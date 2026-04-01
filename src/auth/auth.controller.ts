import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateUserDto, LoginUserDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import type { AuthRequest } from './types/auth-request.types';
import { setAuthCookies } from 'src/common/utils/cookie.util';
import type { Response } from 'express';


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
    async login(@Body() dto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.loginUser(dto);
        setAuthCookies(res, result.accessToken, result.refreshToken);
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
    @Put('profile')
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
