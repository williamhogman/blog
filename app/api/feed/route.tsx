import { Feed } from "feed";
import { NextRequest } from "next/server";
import data from "../../../lib/data";
import { getSortedPostsData } from "../../../lib/posts";

async function generateFeed() {
  const posts = await getSortedPostsData();

  const feed = new Feed({
    title: data.siteName,
    description: data.description,
    id: data.url,
    link: "http://example.com/",
    language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: "http://example.com/image.png",
    favicon: "http://example.com/favicon.ico",
    copyright: "Copyright Sobel IO AB",
    updated: new Date(posts[0].date),
    generator: "Blog",
    feedLinks: {
      json: "https://example.com/json",
      atom: "https://example.com/atom",
    },
    author: {
      name: "William Rudenmalm",
      email: "william@sobel.io",
      link: "https://whn.se",
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.id,
      link: `https://blog.whn.se/posts/${post.id}`,
      description: post.description,
      date: new Date(post.date),
    });
  });
  return feed;
}

export async function GET(req: NextRequest) {
  const format = new URL(req.url).searchParams.get("format");
  const feed = await generateFeed();

  let content, contentType;
  if (format === "json") {
    content = feed.json1();
    contentType = "application/feed+json";
  } else if (format === "rss" || format === "") {
    content = feed.rss2();
    contentType = "application/rss+xml";
  } else if (format === "atom") {
    content = feed.atom1();
    contentType = "application/atom+xml";
  } else {
    return new Response("Not such format", {
      status: 404,
    });
  }
  const headers = {
    "Cache-Control": "Cache-Control: public, max-age=60",
    "Last-Modified": new Date().toUTCString(),
    "Content-Type": contentType,
  };
  return new Response(content, { headers });
}
