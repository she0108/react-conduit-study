import { useEffect, useState } from "react";

import { getTags } from "../../apis/tags.js";
import TagLink from "./TagLink.jsx";
import ErrorMessages from "../common/ErrorMessages.jsx";

import styles from "./PopularTags.module.css";

export default function PopularTags({ className = "" }) {
  const [tags, setTags] = useState(null);
  const [tagsError, setTagsError] = useState(null);

  useEffect(() => {
    let ignore = false;

    getTags()
      .then((data) => {
        if (!ignore) setTags(data.tags);
      })
      .catch((error) => {
        if (!ignore) setTagsError(error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <h2>인기 태그</h2>
      {tagsError ? (
        <ErrorMessages error={tagsError} />
      ) : tags === null ? (
        <p role="status">태그를 불러오는 중…</p>
      ) : tags.length ? (
        <div className={styles.tags}>
          {tags.map((value) => (
            <TagLink key={value} tag={value} />
          ))}
        </div>
      ) : (
        <p>아직 태그가 없습니다.</p>
      )}
    </aside>
  );
}
