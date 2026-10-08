import type { ThrottlerOptions } from '@nestjs/throttler';

export const THROTTLERS: ThrottlerOptions[] = [
  { name: 'minute', ttl: 60_000, limit: 60 },
  { name: 'hour', ttl: 3_600_000, limit: 500 },
  { name: 'day', ttl: 86_400_000, limit: 5_000 },
];

export const SKIP_ALL_THROTTLERS = { minute: true, hour: true, day: true };
