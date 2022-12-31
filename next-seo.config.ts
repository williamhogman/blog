import type { NextSeoProps } from "next-seo";
import data from "./lib/data";

export const NEXT_SEO_DEFAULT: NextSeoProps = {
  title: data.defaultTitle,
  titleTemplate: data.titleTemplate,
  openGraph: {
    type: "website",
    url: data.url,
    siteName: data.siteName,
    locale: "en_US",
    title: data.defaultTitle,
    description: data.subTitle,
    images: [
      {
        url: "https://www.test.ie/og-image-a-01.jpg",
        width: 800,
        height: 600,
        alt: "Og Image Alt A",
        type: "image/jpeg",
        secureUrl: "https://www.test.ie/secure-og-image-a-01.jpg",
      },
    ],
  },
  twitter: {
    handle: `@${data.twitter}`,
    site: `@${data.twitter}`,
    cardType: "summary_large_image",
  },
};
