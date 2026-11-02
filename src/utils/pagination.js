export const PAGE_SIZE = 10;

export function getPageCount(total) {
  return Math.ceil(total / PAGE_SIZE);
}

export function getPage(value) {
  const page = Number(value);

  return /^[1-9]\d*$/.test(value ?? "") &&
    Number.isSafeInteger(page) &&
    Number.isSafeInteger((page - 1) * PAGE_SIZE)
    ? page
    : 1;
}
