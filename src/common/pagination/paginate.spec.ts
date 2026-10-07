import { paginate } from './paginate';

describe('paginate', () => {
  it('builds the page meta', () => {
    expect(paginate([], 41, { page: 2, pageSize: 20 }).meta).toEqual({
      page: 2,
      pageSize: 20,
      total: 41,
      totalPages: 3,
    });
  });

  it('has zero pages when there are no items', () => {
    expect(paginate([], 0, { page: 1, pageSize: 20 }).meta.totalPages).toBe(0);
  });
});
