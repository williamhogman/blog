/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source:
          "/never-write-another-for-loop-replacing-java-8-for-loops-with-foreach-calls-using-the-stream-api-539b799172cc",
        destination:
          "/posts/Never-write-another-for-loop-Replacing-Java-8-for-loops-with-forEach-calls-using-the-Stream-API",
        permanent: true,
      },
      {
        source: "/installing-meteor-on-archlinux-f80a7505bac7",
        destination: "/posts/installing-meteor-on-archlinux/",
        permanent: true,
      },
      {
        source: "/the-implicit-explicit-gap-69cc5fe8fcf5",
        destination: "/posts/the-implicit-explicit-gap",
        permanent: true,
      },
      {
        source: "/writing-good-react-components-9923f6682d85",
        destination: "/posts/writing-good-react-components",
        permanent: true,
      },
      {
        source: "/k-means-clustering-in-r-c24115efdc82",
        destination: "/posts/k-means-clustering-in-r",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
