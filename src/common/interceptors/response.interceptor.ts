import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Paginated } from '../pagination/paginate';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        map((value: unknown) =>
          value instanceof Paginated
            ? { data: value.items, meta: value.meta }
            : { data: value ?? null },
        ),
      );
  }
}
