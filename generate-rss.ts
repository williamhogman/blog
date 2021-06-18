const fs = require("fs");
const fsp = fs.promises;

import { generateRss } from "./lib/rss";

async function generate() {
  const data = await generateRss();
  await fsp.writeFile("./public/rss.xml", data);
}

generate();
