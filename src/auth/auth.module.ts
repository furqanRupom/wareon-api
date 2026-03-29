import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { User, UserSchema } from './schemas/auth.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [JwtModule.register({}), PassportModule.register({ defaultStrategy: 'jwt' }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [AuthService, AuthRepository,JwtStrategy,JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard]
})
export class AuthModule {}
