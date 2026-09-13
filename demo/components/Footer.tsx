import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner"><div><strong>{siteConfig.title}</strong><p>© {siteConfig.year} Authors</p></div><div><p>Companion page for the paper and its authors.</p><nav aria-label="Footer navigation">{siteConfig.paperUrl && <a href={siteConfig.paperUrl}>Paper</a>}{siteConfig.githubUrl && <a href={siteConfig.githubUrl}>GitHub</a>}</nav></div></div>
    </footer>
  );
}
