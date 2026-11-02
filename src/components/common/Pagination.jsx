import { Link, useLocation } from "react-router";

import { getPageCount } from "../../utils/pagination.js";

import styles from "./Pagination.module.css";

export default function Pagination({ page, total }) {
  const location = useLocation();

  const count = getPageCount(total);

  if (count <= 1) return null;

  const pages = [
    ...new Set([
      1,
      ...Array.from({ length: 5 }, (_, index) => page - 2 + index),
      count,
    ]),
  ]
    .filter((value) => value >= 1 && value <= count)
    .sort((a, b) => a - b);

  function href(value) {
    const params = new URLSearchParams(location.search);

    params.set("page", value);

    return `${location.pathname}?${params}`;
  }

  return (
    <nav className={styles.pagination} aria-label="글 목록 페이지">
      {page > 1 && (
        <Link to={href(page - 1)} aria-label="이전 페이지">
          이전
        </Link>
      )}
      {pages.map((value, index) => (
        <span key={value}>
          {index > 0 && value - pages[index - 1] > 1 && (
            <span className={styles.gap}>…</span>
          )}
          <Link
            to={href(value)}
            aria-label={`${value}페이지`}
            aria-current={value === page ? "page" : undefined}
          >
            {value}
          </Link>
        </span>
      ))}
      {page < count && (
        <Link to={href(page + 1)} aria-label="다음 페이지">
          다음
        </Link>
      )}
    </nav>
  );
}
