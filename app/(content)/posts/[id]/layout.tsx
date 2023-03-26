import AboutTheAuthor from "../../../../components/AboutTheAuthor";

const REMARK_42_SCRIPT_TAG = `
var remark_config = {
    host: 'https://comments.sobel.io',
    site_id: 'wvst',
}
`;
const REMARK_42_SCRIPT = `
!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);
`;

export default function PostLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: REMARK_42_SCRIPT_TAG,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: REMARK_42_SCRIPT,
        }}
      />
      {children}
      <div id="remark42"></div>
      <AboutTheAuthor />
    </>
  );
}
