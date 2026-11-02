import placeholder from "../assets/avatar-placeholder.svg";

import styles from "./Avatar.module.css";

export default function Avatar({ image, size = 36 }) {
  return (
    <img
      className={styles.avatar}
      src={image || placeholder}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = placeholder;
      }}
    />
  );
}
