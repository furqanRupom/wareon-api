import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      statusCode: 200,
      success: true,
      message: 'Wareon API is running successfully !',
    };
  }

  getHealth() {
    return {
      statusCode: 200,
      success: true,
      message: 'Healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  getVersion() {
    return {
      statusCode: 200,
      success: true,
      message: 'Version info fetched',
      version: '1.0.0',
    };
  }
}