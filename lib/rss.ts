import data from './data'
import { Post, getSortedPostsData } from "./posts"

async function generateRssItem(post: Post): Promise<string> {
  return `
    <item>
      <guid>${data.url}/posts/${post.id}</guid>
      <title>${post.title}</title>
      <description>${post.description}</description>
      <link>${data.url}/posts/${post.id}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <content:encoded><![CDATA[${post.description}]]></content:encoded>
    </item>
  `
}

async function generateRssFromPosts(posts: Post[]): Promise<string> {
  const itemsList = await Promise.all(posts.map(generateRssItem))
  return `
    <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
      <channel>
        <title>${data.siteName}</title>
        <link>${data.url}</link>
        <description>${data.subTitle}</description>
        <language>en</language>
        <lastBuildDate>${new Date(posts[0].date)}</lastBuildDate>
        <atom:link href="${data.url}" rel="self" type="application/rss+xml"/>
        ${itemsList.join('')}
      </channel>
    </rss>
  `
}

async function generateRss(): Promise<string> {
  return generateRssFromPosts(getSortedPostsData())
}