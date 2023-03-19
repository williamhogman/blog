import Image from "next/image";
import styles from "./AboutTheAuthor.module.css";

function AboutTheAuthor() {
  return (
    <section className={styles.section}>
      <div className={styles.imgwrap}>
        <Image
          src="/img/william-black.jpg"
          width={500}
          height={500}
          alt="A picture of William Rudenmalm"
          className={styles.img}
        />
      </div>
      <div>
        <h2 className={styles.name}>William Rudenmalm</h2>
        <p className={styles.title}>Technologist at Sobel.IO</p>
        <p>
          William Rudenmalm is a european technologist passionate about the next
          big thing and the people building it. William is particularly
          interested in scaling engineering organizations and navigating trade
          offs of architecture and velocity. In the field of computer science,
          his expertise lies in distributed systems, scalability and machine
          learning. Among the technologies William is particularly excited about
          are Kubernetes, Rust, nats, Kafka and neo4j. William is part of the
          boutique engineering consultancy{" "}
          <a href="https://sobel.io">Sobel.IO</a>.
        </p>
      </div>
    </section>
  );
}

export default AboutTheAuthor;
