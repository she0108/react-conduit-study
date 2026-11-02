import { useQuery } from "@tanstack/react-query";

import { getTags } from "../../apis/tags.js";
import TagLink from "./TagLink.jsx";
import ErrorMessages from "../common/ErrorMessages.jsx";

import styles from "./PopularTags.module.css";

export default function PopularTags({ className = "" }) {
  const { data, error, isPending, isLoadingError } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <h2>인기 태그</h2>
      {isLoadingError ? (
        <ErrorMessages error={error} />
      ) : isPending ? (
        <p role="status">태그를 불러오는 중…</p>
      ) : data.tags.length ? (
        <div className={styles.tags}>
          {data.tags.map((value) => (
            <TagLink key={value} tag={value} />
          ))}
        </div>
      ) : (
        <p>아직 태그가 없습니다.</p>
      )}
    </aside>
  );
}
