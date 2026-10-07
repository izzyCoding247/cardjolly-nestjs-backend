export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class Paginated<T> {
  constructor(
    readonly items: T[],
    readonly meta: PageMeta,
  ) {}
}

export function paginate<T>(
  items: T[],
  total: number,
  { page, pageSize }: { page: number; pageSize: number },
): Paginated<T> {
  return new Paginated(items, {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}
