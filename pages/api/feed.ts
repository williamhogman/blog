import { generateRss } from "../../lib/rss"
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFile } from 'fs/promises';

export default async function feedFunc(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.end(await readFile(new URL('../rss.xml', import.meta.url), 'utf-8'));
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
  }
}