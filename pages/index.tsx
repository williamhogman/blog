import { NextSeo } from "next-seo";
import Link from "next/link";
import Bubble from "../components/Bubble";
import Layout from "../components/Layout";
import Post from "../components/Post";
import type { ClientSidePost } from "../lib/posts";
import { getSortedPostsData } from "../lib/posts";
import styles from "./index.module.css";

export async function getStaticProps() {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

type Props = { allPostsData: ClientSidePost[] };

export default function Home({ allPostsData }: Props) {
  return (
    <Layout home>
      <NextSeo
        openGraph={{
          type: "website",
          title: "Will vs Technology - William Rudenmalm's blog",
          description:
            "Where I, William Rudenmalm, document my quixotic struggle against technology.",
        }}
      />
      {allPostsData.map((post, index) => (
        <Bubble key={index} className={styles.postBubble}>
          <Post post={post} />
        </Bubble>
      ))}
      <div
        style={{
          gridColumn: "1 / -1",
          textAlign: "center",
          fontVariant: "small-caps",
          textTransform: "lowercase",
        }}
      >
        <small>
          {"\u00A9"} Sobel.IO - <Link href="/about">Legal</Link>
        </small>
      </div>
    </Layout>
  );
}
