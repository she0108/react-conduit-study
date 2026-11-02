import styles from "./ErrorMessages.module.css";

export default function ErrorMessages({ error }) {
  if (!error) return null;

  const details =
    error.errors && typeof error.errors === "object"
      ? Object.entries(error.errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages]).map(
            (message) => `${field}: ${String(message)}`,
          ),
        )
      : [];

  return (
    <div role="alert" className={styles.error}>
      <p>{typeof error === "string" ? error : error.message}</p>
      {details.length > 0 && (
        <ul>
          {details.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
