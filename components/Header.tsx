import Link from "next/link";
import styles from "./Header.module.css";

export default function Header({
  className,
  small,
}: {
  className?: string;
  small?: boolean;
}) {
  const TITLE = "Will vs Technology";
  const header = small ? (
    <h3 className={`${styles.heading} ${styles.small}`}>{TITLE}</h3>
  ) : (
    <h1 className={styles.heading}>{TITLE}</h1>
  );
  return (
    <header className={[className, styles.header].filter((x) => !!x).join(" ")}>
      <Link href="/">{header}</Link>
      <p className={styles.tagline}>
        Where I, <a href="https://whn.se/">William Rudenmalm</a>, document my
        quixotic struggle against technology.
      </p>
    </header>
  );
}
