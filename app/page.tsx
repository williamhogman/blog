import Link from "next/link";
import Bubble from "../components/Bubble";
import Layout from "../components/Layout";
import Post from "../components/Post";
import { getSortedPostsData } from "../lib/posts";
import styles from "./index.module.css";

type Props = {};

export default async function Home(props: Props) {
  const allPostsData = await getSortedPostsData();
  return (
    <Layout home>
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
