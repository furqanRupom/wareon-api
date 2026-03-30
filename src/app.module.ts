import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CategoryRepository } from './category/category.repository';
import { AuthRepository } from './auth/auth.repository';
import { ProductModule } from './product/product.module';
import { ProductRepository } from './product/product.repository';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get<string>('mongodbUri'),
        };
      },
    }),
    AuthModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService, CategoryRepository,AuthRepository, ProductRepository],
})
export class AppModule {}
