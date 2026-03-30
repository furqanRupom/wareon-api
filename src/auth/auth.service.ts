import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto, CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async registerUser(dto:CreateUserDto){
        return this.authRepository.createUser(dto);
    }
    async loginUser(dto:LoginUserDto){
        const user = await this.authRepository.findByEmail(dto.email);
        if(!user)  {
            throw new NotFoundException('User not found')
        };
        const isPasswordValid = await user.comparePassword(dto.password);
        if(!isPasswordValid) {
            throw new NotFoundException('Invalid credentials')
        };
        const payload = { id: user.userId, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('secretAccessToken'),
            expiresIn: this.configService.get<number>('accessTokenExpiry'),
        })

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('secretRefreshToken'),
            expiresIn: this.configService.get<number>('refreshTokenExpiry'),
        })
        return {accessToken, refreshToken };
    }
    async profile(userId: string) {
        const user = await this.authRepository.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId: string, updateData: Partial<CreateUserDto>) {
        const user = await this.authRepository.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        Object.assign(user, updateData);
        await user.save();
        return user;
    }
    async changePassword(userId: string, dto:ChangePasswordDto) {
        const user = await this.authRepository.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await user.comparePassword(dto.currentPassword);
        if (!isPasswordValid) {
            throw new NotFoundException('Current password is incorrect');
        }
        user.password = dto.newPassword;
        await user.save();
        return null
    }
}
