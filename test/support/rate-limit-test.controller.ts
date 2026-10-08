import { Controller, Get } from '@nestjs/common';

@Controller('rate-limit-test')
export class RateLimitTestController {
  @Get()
  ping() {
    return { ok: true };
  }
}
