import { Controller, Get, Options, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('debug-cors')
export class DebugCorsController {
  @Options()
  options(@Req() req: Request, @Res() res: Response) {
    const allowed = (process.env.ALLOWED_ORIGINS || '*');
    res.setHeader('Access-Control-Allow-Origin', allowed === '*' ? '*' : allowed.split(',')[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).send();
  }

  @Get()
  get(@Res() res: Response) {
    return res.json({ ok: true, originAllowed: process.env.ALLOWED_ORIGINS || '*' });
  }
}
