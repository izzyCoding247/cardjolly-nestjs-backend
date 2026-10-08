import { assertTestDatabase } from './support/assert-test-database';
import { loadTestEnv } from './support/load-test-env';

loadTestEnv();
assertTestDatabase(process.env.DATABASE_URL);
