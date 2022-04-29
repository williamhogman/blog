import "highlight.js/styles/github.css";
import { GetStaticPaths, GetStaticProps } from "next";
import AboutTheAuthor from "../../components/AboutTheAuthor";
import PostLayout from "../../components/PostLayout";
import { getAllPostIds, getPostData } from "../../lib/posts";

type PostParams = {
  id: string;
};

export const getStaticProps: GetStaticProps<PostProps, PostParams> = async ({
  params,
}) => {
  if (!params) {
    return { notFound: true };
  }
  const postData = await getPostData(params.id);
  const converedPostData = { ...postData, date: +postData.date };
  return {
    props: {
      postData: converedPostData,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

interface PostProps {
  postData: any;
}

function date(d: number): string {
  return new Date(d).toDateString();
}

export default function Post({ postData }: PostProps) {
  return (
    <PostLayout>
      <h1>{postData.title}</h1>
      <time dateTime={date(postData.date)}>{date(postData.date)}</time>
      <div
        className="transparent"
        style={{ display: "contents" }}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
      <AboutTheAuthor />
    </PostLayout>
  );
}
