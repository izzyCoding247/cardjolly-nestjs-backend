import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  MethodNotAllowedException,
  Param,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { paginate } from '../../src/common/pagination/paginate';
import { Prisma } from '../../src/generated/prisma/client';

class AddressDto {
  @IsString()
  city: string;
}

class ContractDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

@Controller('contract-test')
export class ContractTestController {
  @Get('item')
  item() {
    return { id: 1, name: 'Item' };
  }

  @Get('list')
  list() {
    return paginate([{ id: 1 }, { id: 2 }], 5, { page: 1, pageSize: 2 });
  }

  @Post('validate')
  validate(@Body() body: ContractDto) {
    return body;
  }

  @Get('method-not-allowed')
  methodNotAllowed(): never {
    throw new MethodNotAllowedException();
  }

  @Get('too-many')
  tooMany(): never {
    throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  @Get('crash')
  crash(): never {
    throw new Error('connection refused at db-internal:5432');
  }

  @Get('prisma/:code')
  prismaFailure(@Param('code') code: string): never {
    throw new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
      code,
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  @Get('unavailable')
  unavailable(): never {
    throw new ServiceUnavailableException();
  }
}
