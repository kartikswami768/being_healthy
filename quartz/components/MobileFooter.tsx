import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { buildSiteNavigation, NavigationLink } from "../navigation/SiteNavigation"

function InlineLinks({ links }: { links: NavigationLink[] }) {
  return (
    <div class="mobile-footer-links">
      {links.map((link, index) => (
        <span class="mobile-footer-link-wrap">
          {index > 0 && (
            <span class="mobile-footer-separator" aria-hidden="true">
              ·
            </span>
          )}
          <a href={link.href} aria-current={link.current ? "page" : undefined}>
            {link.label}
          </a>
        </span>
      ))}
    </div>
  )
}

const MobileFooter: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  const navigation = buildSiteNavigation(allFiles, fileData.slug ?? "")

  return (
    <footer class="mobile-site-footer" aria-label="Site navigation">
      <div class="mobile-footer-group">
        <h2>Explore</h2>
        <InlineLinks links={navigation.primary} />
      </div>

      <div class="mobile-footer-group">
        <h2>Writing</h2>
        <InlineLinks links={navigation.writing} />
      </div>
    </footer>
  )
}

MobileFooter.css = `
.mobile-site-footer {
  display: none;
}

@media all and (max-width: 1000px) {
  .mobile-site-footer {
    display: block;
    width: 100%;
    margin-top: 3rem;
    padding-top: 1.75rem;
    border-top: 1px solid var(--lightgray);
  }

  .mobile-footer-group {
    margin-bottom: 1.25rem;
  }

  .mobile-footer-group:last-child {
    margin-bottom: 0;
  }

  .mobile-site-footer .mobile-footer-group h2 {
    margin: 0 0 0.4rem;
    color: var(--site-muted);
    font-family: var(--bodyFont);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .mobile-footer-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.1rem 0.4rem;
  }

  .mobile-footer-link-wrap {
    display: inline-flex;
    align-items: center;
  }

  .mobile-site-footer .mobile-footer-links a {
    color: var(--darkgray);
    font-family: var(--bodyFont);
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.5;
    text-decoration: none;
  }

  .mobile-site-footer .mobile-footer-links a:hover,
  .mobile-site-footer .mobile-footer-links a[aria-current="page"] {
    color: var(--secondary);
  }

  .mobile-footer-separator {
    color: var(--lightgray);
  }
}
`

export default (() => MobileFooter) satisfies QuartzComponentConstructor
