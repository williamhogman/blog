import Layout from "../components/Layout";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import React from "react";
import Post from "../components/Post";
import Bubble from "../components/Bubble";
import type { ClientSidePost } from "../lib/posts";
import styles from "./index.module.css";
import { NextSeo } from "next-seo";

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
          url: "https://www.example.com/page",
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
    </Layout>
  );
}
