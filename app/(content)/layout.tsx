import PostLayout from "../../components/PostLayout";

export default function ContentLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return <PostLayout>{children}</PostLayout>;
}
