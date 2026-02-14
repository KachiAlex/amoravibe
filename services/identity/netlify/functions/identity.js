const serverless = require('serverless-http');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe, RequestMethod } = require('@nestjs/common');
const { AppModule } = require('../../dist/app.module');

let lambdaHandler = null;
let initError = null;

async function createHandler() {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://amoravibe.netlify.app,https://amoravibe.vercel.app,http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.use(require('cors')({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('CORS not allowed by list'));
    },
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  }));

  const adapter = new ExpressAdapter(app);

  const initTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Function init timeout after 25s')), 25000));

  try {
    const nestAppPromise = NestFactory.create(AppModule, adapter, { logger: ['log','warn','error'] });
    const nestApp = await Promise.race([nestAppPromise, initTimeout]);
    nestApp.setGlobalPrefix('api/v1', { exclude: [{ path: '/', method: RequestMethod.GET }] });
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await nestApp.init();
    return serverless(app);
  } catch (err) {
    console.error('[Netlify Create Handler Error]', err);
    throw err;
  }
}

exports.handler = async function(event, context) {
  try {
    if (!lambdaHandler) {
      try {
        lambdaHandler = await createHandler();
      } catch (err) {
        initError = err;
        console.error('[Netlify Init Error]', err);
        return {
          statusCode: 500,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ error: 'Function initialization failed', message: initError?.message }),
        };
      }
    }

    return await lambdaHandler(event, context);
  } catch (err) {
    console.error('[Netlify Handler Error]', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Request handler failed' }) };
  }
};
