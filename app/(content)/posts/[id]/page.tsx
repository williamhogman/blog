import "highlight.js/styles/github.css";
import { GetStaticPaths, Metadata } from "next";
import { notFound } from "next/navigation";
import AboutTheAuthor from "../../../../components/AboutTheAuthor";
import { getAllPostIds } from "../../../../lib/posts";
import { getData } from "./getData";

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

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

export default async function Post({ params: { id } }: PostProps) {
  const { notFound: nf, postData } = await getData(id);
  if (nf) {
    return notFound();
  }
  return (
    <>
      <h1>{postData.title}</h1>
      <time dateTime={date(postData.date)}>{date(postData.date)}</time>
      <div
        className="transparent"
        style={{ display: "contents" }}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
      <AboutTheAuthor />
    </>
  );
}
