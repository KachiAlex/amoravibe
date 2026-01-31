/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import express from 'express';
const serverless = require('serverless-http');
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let handler: any;

async function createHandler() {
  const app = express();
  const adapter = new ExpressAdapter(app);
  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: ['log', 'warn', 'error'],
  });
  nestApp.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  await nestApp.init();
  return serverless(app);
}

export default async function (req: any, res: any) {
  if (!handler) {
    handler = await createHandler();
  }
  return handler(req, res);
}
