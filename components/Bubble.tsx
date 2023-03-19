import classnames from "classnames";
import { PropsWithChildren } from "react";
import styles from "./Bubble.module.css";

type Props = PropsWithChildren<{ className?: string }>;

function Bubble({ children, className }: Props) {
  return (
    <section className={classnames(styles.bubble, className)}>
      {children}
    </section>
  );
}

export default Bubble;
