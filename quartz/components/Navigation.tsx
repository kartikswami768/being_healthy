import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Navigation: QuartzComponent = ({ fileData }) => {
  const currentSlug = fileData.slug ?? ""
  const links = [
    { label: "Home", href: "/", slug: "index" },
    { label: "Blog", href: "/blog", slug: "blog" },
    { label: "About", href: "/about", slug: "about" },
  ]

  return (
    <nav class="primary-navigation" aria-label="Primary">
      <div class="primary-navigation-links">
        {links.map((link) => (
          <a
            class="primary-navigation-link"
            href={link.href}
            aria-current={currentSlug === link.slug ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

Navigation.css = `
.primary-navigation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--site-space-3) var(--site-space-5);
  margin-left: auto;
  color: var(--site-muted);
}

.primary-navigation-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--site-space-4) var(--site-space-5);
}

.primary-navigation-link {
  color: var(--site-muted);
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
}

.primary-navigation-link:hover {
  color: var(--site-heading);
}

.primary-navigation-link[aria-current="page"] {
  color: var(--site-heading);
  text-decoration: underline;
  text-decoration-color: var(--site-primary);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.35rem;
}

// Publication pages should not expose volatile date/reading-time metadata.
body[data-slug="index"] .content-meta,
body[data-slug="blog"] .content-meta,
body[data-slug="about"] .content-meta {
  display: none;
}

// Internal links should read like normal editorial links, not highlights.
a.internal {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

@media all and (max-width: 800px) {
  .primary-navigation {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }

  .primary-navigation-link {
    padding: var(--site-space-2) 0;
  }
}
`

export default (() => Navigation) satisfies QuartzComponentConstructor
