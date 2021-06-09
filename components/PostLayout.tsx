import Link from "next/link";
import Header from "./Header";
import styles from "./PostLayout.module.css";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

function PostLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <Header small className={styles.aside} />
      {children}
    </div>
  );
}

export default PostLayout;
