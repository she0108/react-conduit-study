export const PAGE_SIZE = 10;

export function getPageCount(total) {
  return Math.ceil(total / PAGE_SIZE);
}

export function getPage(value) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}
