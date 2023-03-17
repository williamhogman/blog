import type { Metadata } from "next";
import data from "../lib/data";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: { template: data.titleTemplate, default: data.defaultTitle },
  description: data.description,

  openGraph: {
    type: "website",
    url: data.url,
    siteName: data.siteName,
  },
  twitter: {
    site: `@${data.twitter}`,
    creator: `@${data.twitter}`,
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
