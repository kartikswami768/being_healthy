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
        <LinkGroup title="Recent" links={navigation.recent} />
      </div>
    </aside>
  )
}

DesktopSidebar.css = `
.site-sidebar {
  display: none;
}

@media all and (min-width: 1001px) {
  .site-sidebar {
    display: block;
    min-width: 0;
    max-height: calc(100vh - 2rem);
    position: sticky;
    top: 1rem;
  }

  .site-sidebar-scroll {
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 0.75rem;
    scrollbar-width: thin;
  }

  .site-sidebar-group {
    margin-bottom: 1.5rem;
  }

  .site-sidebar-group h2 {
    margin: 0 0 0.5rem;
    color: var(--site-muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .site-sidebar-group ul {
    display: grid;
    gap: 0.28rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .site-sidebar-group a {
    display: block;
    padding: 0.22rem 0;
    color: var(--darkgray);
    font-size: 0.84rem;
    line-height: 1.35;
    text-decoration: none;
  }

  .site-sidebar-group a:hover,
  .site-sidebar-group a[aria-current="page"] {
    color: var(--secondary);
  }
}
`

export default (() => DesktopSidebar) satisfies QuartzComponentConstructor
