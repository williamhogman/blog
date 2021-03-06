import { generateRss } from "../lib/rss";
import { GetStaticProps } from "next";
import fs from "fs/promises";

export default function FeedDummy() {
  return <div>Feed dummy</div>;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const data = await generateRss();
  await fs.writeFile(new URL("./rss.xml", import.meta.url), data);
  return { props: {} };
};
