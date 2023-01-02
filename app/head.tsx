import { NextSeo } from "next-seo";

import { NEXT_SEO_DEFAULT } from "../next-seo.config"; // your path will vary

export default async function Head({ params }: { params: { id: string } }) {
  return (
    <NextSeo
      {...NEXT_SEO_DEFAULT}
      openGraph={{
        type: "website",
        title: "Will vs Technology - William Rudenmalm's blog",
        description:
          "Where I, William Rudenmalm, document my quixotic struggle against technology.",
      }}
      useAppDir={true}
    />
  );
}
