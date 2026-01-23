import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class HomeController {
  private readonly marketingUrl = 'https://amoravibe.vercel.app';

  @Get()
  @Header('Cache-Control', 'no-store')
  redirectToMarketing(@Res() res: Response) {
    return res.redirect(302, this.marketingUrl);
  }
}
