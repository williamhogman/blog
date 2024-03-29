import "highlight.js/styles/github.css";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAllPostIds } from "../../../../lib/posts";
import { getData } from "./getData";
export const dynamicParams = false;
export async function generateStaticParams() {
  const paths = await getAllPostIds();
  return paths.map((p) => ({ id: p.params.id }));
}

export async function generateMetadata({
  params: { id },
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { notFound: nf, postData } = await getData(id);
  if (nf) {
    return notFound();
  }
  return {
    title: postData.title,
    description: postData.description,
    openGraph: {
      type: "article",
      authors: ["William Rudenmalm"],
      publishedTime: new Date(postData.date).toISOString(),
      url: `https://blog.whn.se/posts/${id}`,
      images: [
        {
          url: `https://blog.whn.se/api/og?title=${encodeURIComponent(
            postData.title
          )}`,
        },
      ],
    },
  };
}

interface PostProps {
  params: {
    id?: string;
  };
}

function date(d: number): string {
  return new Date(d).toDateString();
}

const REDIR = true;

export default async function Post({ params: { id } }: PostProps) {
  const { notFound: nf, postData } = await getData(id);
  if (nf) {
    return notFound();
  }
  if (REDIR) {
    redirect("https://sobel.io/blog/wvst/" + id);
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5em" }}>{postData.title}</h1>
      <time dateTime={date(postData.date)}>{date(postData.date)}</time>
      <div
        className="transparent blog-text"
        style={{ display: "contents" }}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
    </>
  );
}
