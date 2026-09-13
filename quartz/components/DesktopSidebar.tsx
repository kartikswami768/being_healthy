import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { buildSiteNavigation, NavigationLink } from "../navigation/SiteNavigation"

function LinkGroup({ title, links }: { title: string; links: NavigationLink[] }) {
  if (links.length === 0) return null

  return (
    <section class="site-sidebar-group">
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li>
            <a href={link.href} aria-current={link.current ? "page" : undefined}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

const DesktopSidebar: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  const navigation = buildSiteNavigation(allFiles, fileData.slug ?? "")

  return (
    <aside class="site-sidebar" aria-label="Explore">
      <div class="site-sidebar-scroll">
        <LinkGroup title="Explore" links={navigation.primary} />
        <LinkGroup title="Writing" links={navigation.writing} />
      </div>
    </aside>
  )
}

DesktopSidebar.css = `
.site-sidebar {
  display: none;
}

@media all and (min-width: 801px) {
  .sidebar-scroll-region {
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }

  .site-sidebar {
    display: block;
    min-width: 0;
    position: static;
  }

  .site-sidebar-scroll {
    max-height: none;
    overflow: visible;
    padding-right: 0.25rem;
  }

  .site-sidebar-group {
    margin-bottom: 1.35rem;
  }

  .site-sidebar-group:last-child {
    margin-bottom: 0;
  }

  .site-sidebar .site-sidebar-group h2 {
    margin: 0 0 0.5rem;
    color: var(--site-muted);
    font-family: var(--bodyFont);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .site-sidebar .site-sidebar-group ul {
    display: grid;
    gap: 0.22rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .site-sidebar .site-sidebar-group a {
    display: block;
    padding: 0.16rem 0;
    color: var(--darkgray);
    font-family: var(--bodyFont);
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.35;
    text-decoration: none;
  }

  .site-sidebar .site-sidebar-group a:hover,
  .site-sidebar .site-sidebar-group a[aria-current="page"] {
    color: var(--secondary);
  }
}
`

export default (() => DesktopSidebar) satisfies QuartzComponentConstructor
