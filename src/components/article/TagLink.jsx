import { Link } from "react-router";

export default function TagLink({ tag }) {
  return (
    <Link className="tag" to={`/?tag=${encodeURIComponent(tag)}&page=1`}>
      {tag}
    </Link>
  );
}
