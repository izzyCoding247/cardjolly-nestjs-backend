import { Controller, Get } from '@nestjs/common';
import { ClientIp } from '../../src/common/decorators/client-ip.decorator';

@Controller('client-ip-test')
export class ClientIpTestController {
  @Get()
  clientIp(@ClientIp() ip: string | null) {
    return { ip };
  }
}
