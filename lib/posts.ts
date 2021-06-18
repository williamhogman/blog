import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import unified from 'unified'
import markdown from 'remark-parse'
import highlight from 'rehype-highlight'
import remark2rehype from "remark-rehype"
import stringify from 'rehype-stringify'
 
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
  const fileNames = await readPostsDir()
  const allPostsData = (await Promise.all(fileNames.map(readPost))).filter(notNull);
  return allPostsData.sort((a, b) =>
    (b.date.getTime() - a.date.getTime())
  );
}

export async function getBackendPostsWithContent(): Promise<PostWithHTML[]> {
  return await Promise.all((await getPostIds()).map(getPostData))
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

function readPostsDir(): Promise<string[]> {
  return fs.readdir(postsDirectory)
}

async function getPostIds(): Promise<string[]> {
  return (await readPostsDir()).map(x => x.replace(/\.md$/, ""));
}

export async function getAllPostIds(): Promise<{ params: { id: string; } }[]> {
  return (await getPostIds()).map(id => ({ params: { id }}))
}

export async function getPostData(id: string): Promise<PostWithHTML> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const contentHtml = await processMarkdown(matterResult.content);
 
  return {
    id,
    contentHtml,
    ...(matterResult.data as FrontMatter),
  };
}

const engine = unified()
  .use(markdown)
  .use(remark2rehype)
  .use(highlight)
  .use(stringify);

async function processMarkdown(md: string): Promise<string> {
  const res = await engine.process(md);
  return String(res)
}
