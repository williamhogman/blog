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
        source: "/post/69621609605/writing-good-react-components",
        destination: "/posts/writing-good-react-components",
        permanent: true,
      },
      {
        source:
          "/posts/posts/building-a-kafka-backed-key-value-store-in-rust-part-2-implementation",
        destination:
          "/posts/building-a-kafka-backed-key-value-store-in-rust-part-2-implementation",
        permanent: true,
      },
      {
        source: "/post/20900428947/installing-meteor-on-archlinux",
        destination: "/posts/installing-meteor-on-archlinux",
        permanent: true,
      },
      {
        source:
          "/posts/posts/building-a-kafka-backed-key-value-store-in-rust-part-1-the-design",
        destination:
          "/posts/building-a-kafka-backed-key-value-store-in-rust-part-1-the-design",
        permanent: true,
      },
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
      {
        source: "/posts/:id",
        destination: "https://sobel.io/blog/wvst/:id",
        permanent: false,
      },
      {
        source: "/",
        destination: "https://sobel.io/blog/wvst",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
