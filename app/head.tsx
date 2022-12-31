import { NextSeo } from "next-seo";

import { NEXT_SEO_DEFAULT } from "../next-seo.config"; // your path will vary

export default async function Head({ params }: { params: { id: string } }) {
  return <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />;
}
