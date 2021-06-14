import { generateRss } from "../../lib/rss"
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function feedFunc(req: NextApiRequest, res: NextApiResponse) {
  try {
      const feed = await generateRss();
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.end(feed);
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
  }
}