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
    <footer class="mobile-site-footer" aria-label="Site footer">
      <div class="mobile-footer-group">
        <p class="mobile-footer-eyebrow">Explore</p>
        <InlineLinks links={navigation.primary} />
      </div>

      <div class="mobile-footer-group">
        <p class="mobile-footer-eyebrow">Writing</p>
        <InlineLinks links={navigation.writing} />
      </div>

      <div class="mobile-footer-group mobile-footer-contact">
        <p class="mobile-footer-eyebrow">Contact</p>
        <div class="mobile-footer-links">
          <span class="mobile-footer-link-wrap">
            <a href="https://github.com/kartikswami768">GitHub</a>
          </span>
          <span class="mobile-footer-link-wrap">
            <span class="mobile-footer-separator" aria-hidden="true">
              ·
            </span>
            <a href="mailto:kartikswami768@gmail.com">Email</a>
          </span>
        </div>
      </div>

      <div class="mobile-footer-signoff">Notes on Being Human · Kartik Swami</div>
    </footer>
  )
}

MobileFooter.css = `
.mobile-site-footer {
  display: none;
}

@media all and (max-width: 1200px) {
  .mobile-site-footer {
    display: block;
    width: calc(100% + 2rem);
    margin-top: 3rem;
    margin-left: -1rem;
    padding: 2rem 1rem 2.25rem;
    border-top: 1px solid var(--site-sage-border);
    background: var(--site-sage-pale);
  }

  .mobile-site-footer + .mobile-site-footer {
    display: none;
  }

  .mobile-footer-group {
    margin-bottom: 1.5rem;
  }

  .mobile-footer-contact {
    margin-bottom: 0;
  }

  .mobile-footer-eyebrow {
    margin: 0 0 0.5rem;
    color: var(--site-sage-deep);
    font-family: var(--headerFont);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .mobile-footer-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.2rem 0.45rem;
  }

  .mobile-footer-link-wrap {
    display: inline-flex;
    align-items: center;
  }

  .mobile-site-footer .mobile-footer-links a {
    color: var(--site-primary);
    font-family: var(--bodyFont);
    font-size: 0.86rem;
    font-weight: 550;
    line-height: 1.55;
    text-decoration: none;
  }

  .mobile-site-footer .mobile-footer-links a:hover,
  .mobile-site-footer .mobile-footer-links a[aria-current="page"] {
    color: var(--site-sage-deep);
  }

  .mobile-footer-separator {
    color: var(--site-sage);
  }

  .mobile-footer-signoff {
    margin-top: 1.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--site-sage-border);
    color: var(--site-muted);
    font-family: var(--headerFont);
    font-size: 0.76rem;
    line-height: 1.4;
  }
}

@media all and (max-width: 340px) {
  .mobile-site-footer {
    width: calc(100% + 1.5rem);
    margin-left: -0.75rem;
  }
}
`

export default (() => MobileFooter) satisfies QuartzComponentConstructor
