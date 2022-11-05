import { PropsWithChildren } from "react";
import Header from "./Header";
import styles from "./Layout.module.css";

type Props = PropsWithChildren<{ home?: boolean }>;
export default function Layout({ children, home }: Props) {
  return (
    <div className={styles.layout}>
      {home ? <Header className={styles.header} /> : null}
      {children}
    </div>
  );
}
