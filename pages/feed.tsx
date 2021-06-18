import { generateRss } from "../lib/rss";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = context.res;
  if (!res) {
    return { props: {} };
  }
  const blogPosts = await generateRss();
  res.setHeader("Content-Type", "text/xml");
  res.write(blogPosts);
  res.end();
  return { props: {} };
};
