import "../styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import data from "../lib/data";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate={data.titleTemplate}
        defaultTitle={data.defaultTitle}
        openGraph={{
          type: "website",
          url: data.url,
          site_name: data.siteName,
        }}
        twitter={{
          handle: `@${data.twitter}`,
          site: `@${data.twitter}`,
          cardType: "summary_large_image",
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
