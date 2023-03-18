import AboutTheAuthor from "../../../../components/AboutTheAuthor";

export default function PostLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AboutTheAuthor />
    </>
  );
}
