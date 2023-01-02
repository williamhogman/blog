import styles from "./about.module.css";
export default function AboutPage() {
  return (
    <>
      <h1>About "Will vs Technology"</h1>
      <span>
        <p>
          <strong>Will vs Technology</strong> is where the author, William
          Rudenmalm, publishes notes on his work on technology. The site and its
          content is owned and operated by{" "}
          <a href="https://sobel.io">Sobel.IO</a>, a boutique consultancy based
          in Stockholm, Sweden. We hope that you find the content on this site
          useful, but make no claims of accuracy or completeness.
        </p>
        <p>
          <dl className={styles.publicationInfo}>
            <dt>Publisher</dt>
            <dd>
              <a href="https://sobel.io">Sobel.IO</a> (Sobel IO AB, a Swedish
              Limited Company)
            </dd>
            <dt>
              Responsible editor{" "}
              <i lang="sv">
                (<abbr title="swedish">sv.</abbr> ansvarig utgivare)
              </i>
            </dt>
            <dd className="m-0">
              <a href="https://whn.se">William Rudenmalm</a>
            </dd>
            <dt>License</dt>
            <dd>
              Copyright {"\u00A9"} Sobel IO AB. Content licenced under the{" "}
              <a
                rel="license"
                href="http://creativecommons.org/licenses/by-nc-nd/4.0/"
              >
                Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
                International License
              </a>
              .
            </dd>
          </dl>
        </p>
        <p>
          The content on this site is provided "as is" and without warranties of
          any kind, either express or implied. The author does not warrant that
          the content is accurate, complete, reliable, current, or error-free.
          The author may make changes to the content at any time without notice.
          The author assumes no responsibility or liability for any errors or
          omissions in the content on the site.
        </p>
      </span>
    </>
  );
}
