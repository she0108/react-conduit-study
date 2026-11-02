export default function FieldError({ error }) {
  if (!error) return null;

  return (
    <small className="fieldError" role="alert">
      {error.message}
    </small>
  );
}
