import Head from "next/head";
import Link from "next/link";
import { PropsWithChildren } from "react";
import styles from "./Layout.module.css";
import Header from "./Header";

type Props = PropsWithChildren<{ home?: boolean }>;
export default function Layout({ children, home }: Props) {
  return (
    <div className={styles.layout}>
      {home ? <Header className={styles.header} /> : null}
      {children}
    </div>
  );
}
