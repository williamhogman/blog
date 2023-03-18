import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import data from "../lib/data";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: { template: data.titleTemplate, default: data.defaultTitle },
  description: data.description,
  alternates: {
    types: {
      "application/rss+xml": "/api/feed?format=rss",
      "application/atom+xml": "/api/feed?format=atom",
      "application/feed+json": "/api/feed?format=json",
    },
  },

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
      <Analytics />
      <body>{children}</body>
    </html>
  );
}
