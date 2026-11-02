import { useEffect, useState } from "react";

import { getTags } from "../apis/tags.js";
import TagLink from "./TagLink.jsx";
import ErrorMessages from "./ErrorMessages.jsx";

import styles from "./PopularTags.module.css";

export default function PopularTags({ className = "" }) {
  const [tags, setTags] = useState(null);
  const [tagsError, setTagsError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getTags(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTags(data.tags);
          setTagsError(null);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setTagsError(error);
      });

    return () => controller.abort();
  }, [reloadCount]);

  function retryTags() {
    setTagsError(null);
    setTags(null);
    setReloadCount((value) => value + 1);
  }

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <h2>인기 태그</h2>
      {tagsError ? (
        <>
          <ErrorMessages error={tagsError} />
          <button onClick={retryTags}>태그 다시 시도</button>
        </>
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
