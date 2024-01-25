import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('https://zefer.vercel.app/', 302)
  redirectMsg() {
    return 'Redirecting you to ZeFer';
  }
}
