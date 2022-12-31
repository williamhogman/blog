import { NextSeo } from "next-seo";

import { NEXT_SEO_DEFAULT } from "../../../../next-seo.config"; // your path will vary
import { getData } from "./getData";

export default async function Head({
  params: { id },
}: {
  params: { id: string };
}) {
  const { notFound, postData } = await getData(id);
  if (notFound) {
    return <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />;
  }
  return (
    <NextSeo
      {...NEXT_SEO_DEFAULT}
      useAppDir={true}
      twitter={{
        handle: "w_hgm",
        site: "Will vs Technology",
      }}
      title={
        postData.title + " - Will vs Technology - William Rudenmalm's blog"
      }
      description={postData.description}
      openGraph={{
        type: "website",
        title: postData.title,
        description: postData.description,
        images: [
          {
            alt: postData.title,
            url:
              "https://blog.whn.xyz/api/og?title=" +
              encodeURIComponent(postData.title),
          },
        ],
      }}
    />
  );
}
