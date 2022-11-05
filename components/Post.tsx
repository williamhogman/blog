import Link from "next/link";
import type { ClientSidePost } from "../lib/posts";
interface Props {
  post: ClientSidePost;
}

function Post({ post: { date, title, id, description } }: Props) {
  return (
    <>
      <Link href={`/posts/${id}`}>
        <h3>{title}</h3>
      </Link>
      {date ? (
        <time dateTime={new Date(date).toISOString()}>
          {new Date(date).toDateString()}
        </time>
      ) : null}
      {description ? <p>{description}</p> : null}
    </>
  );
}

export default Post;
