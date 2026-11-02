import ArticleCard from "./ArticleCard.jsx";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function ArticleList({ articles, loading, error }) {
  if (loading)
    return (
      <p className="status" role="status">
        글을 불러오고 있습니다…
      </p>
    );

  if (error) return <ErrorMessages error={error} />;

  if (!articles.length)
    return <p className="status">아직 게시된 글이 없습니다.</p>;

  return (
    <div>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
