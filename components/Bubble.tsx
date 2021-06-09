import styles from "./Bubble.module.css";
import { PropsWithChildren } from "react";
import classnames from "classnames";

type Props = PropsWithChildren<{ className?: string }>;

function Bubble({ children, className }: Props) {
  return (
    <section className={classnames(styles.bubble, className)}>
      {children}
    </section>
  );
}

export default Bubble;
