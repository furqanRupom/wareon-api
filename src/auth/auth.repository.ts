import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/auth.schema';
import { CreateUserDto } from './dto';

@Injectable()
export class AuthRepository {
    
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
    private async generateUserId(): Promise<string> {
        const lastUser = await this.userModel
            .findOne()
            .sort({ createdAt: -1 })
            .lean();

        let nextNumber = 1;

        if (lastUser?.userId) {
            const lastNumber = parseInt(lastUser.userId.split('-')[1], 10);
            nextNumber = lastNumber + 1;
        }

        return `WERU-${nextNumber.toString().padStart(4, '0')}`;
    }

    async createUser(dto: CreateUserDto): Promise<User> {
        const userId = await this.generateUserId();
        const newUser = new this.userModel({
            ...dto,
            userId,
        });
        return newUser.save();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

}
