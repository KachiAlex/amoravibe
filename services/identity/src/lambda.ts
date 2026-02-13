/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import express from 'express';
const serverless = require('serverless-http');
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let handler: any;
let initError: Error | null = null;

async function createHandler() {
  const app = express();
  // Enable configurable CORS for frontend(s)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://amoravibe.netlify.app,https://amoravibe.vercel.app,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(require('cors')({
    origin: (origin: string, callback: any) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('CORS not allowed by list'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  }));
  const adapter = new ExpressAdapter(app);
  
  // Add timeout to prevent hanging during init
  const initTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Lambda init timeout after 25s')), 25000)
  );

  try {
    const nestAppPromise = NestFactory.create(AppModule, adapter, {
      logger: ['log', 'warn', 'error'],
    });
    
    const nestApp = await Promise.race([nestAppPromise, initTimeout as any]);

    (nestApp as any).setGlobalPrefix('api/v1', {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    });
    (nestApp as any).useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await (nestApp as any).init();
    return serverless(app);
  } catch (error) {
    console.error('[Lambda Create Handler Error]', error);
    throw error;
  }
}

export default async function (req: any, res: any) {
  try {
    if (!handler) {
      try {
        handler = await createHandler();
      } catch (error) {
        initError = error as Error;
        console.error('[Lambda Init Error]', error);
        return res.status(500).json({
          error: 'Lambda initialization failed',
          message: initError?.message,
        });
      }
    }
    return handler(req, res);
  } catch (error) {
    console.error('[Lambda Handler Error]', error);
    return res.status(500).json({ error: 'Request handler failed' });
  }
}
