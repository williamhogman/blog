import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import highlight from 'remark-highlight.js'

const postsDirectory = path.join(process.cwd(), "posts");

export interface Post extends FrontMatter {
  id: string;
}

export type ClientSidePost = Omit<Post, "date"> & {
  date: number;
}

interface FrontMatter {
    date: Date;
  title: string;
  description?: string;
}

export type PostWithHTML = { contentHtml: string; } & Post


function clientizePost(post: Post): ClientSidePost {
    return {
        ...post,
        date: post.date ? post.date.getTime() : 0,
    }
}

async function readPost(fileName: string): Promise<Post | null> {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = await fs.readFile(fullPath, "utf8");
  const matterResult = matter(fileContents);
  if (matterResult.data == null || Object.keys(matterResult.data).length === 0) {
    return null;
  }
    const post = {
      id,
      ...matterResult.data,
    } as Post;
  
  if (post.description == null) {
      post.description = matterResult.excerpt
  }
  return post
}
 
function notNull<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

export async function getBackendPosts(): Promise<Post[]> {
  const fileNames = await fs.readdir(postsDirectory);
  const allPostsData = (await Promise.all(fileNames.map(readPost))).filter(notNull);
  return allPostsData.sort((a, b) =>
    a.date.getTime() - b.date.getTime()
  );
}

export async function getSortedPostsData(): Promise<ClientSidePost[]> {
  
  return (await getBackendPosts()).map(clientizePost).sort((a, b) => {
      if (a.date < b.date) {
          return 1;
      } else if (a.date == b.date) {
          return 0;
      } else {
      return -1;
    }
  })
}


export async function getAllPostIds(): Promise<{ params: { id: string; }}[]> {
  const fileNames = await fs.readdir(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id: string): Promise<PostWithHTML> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(highlight)
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
 
  return {
    id,
    contentHtml,
    ...(matterResult.data as FrontMatter),
  };
}