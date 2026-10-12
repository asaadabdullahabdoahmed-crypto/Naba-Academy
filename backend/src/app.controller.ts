import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): { name: string; version: string } {
    return {
      name: 'Naba Academy API',
      version: 'v1',
    };
  }
}
