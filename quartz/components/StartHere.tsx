import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const writingTypes = new Set(["question", "essay", "case", "note"])

function isPublicWriting(page: QuartzComponentProps["allFiles"][number]): boolean {
  const frontmatter = page.frontmatter as Record<string, unknown> | undefined
  const type = String(frontmatter?.type ?? "")
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
  const slug = String(page.slug ?? "")
  const filePath = String(page.filePath ?? "")
  const title = String(frontmatter?.title ?? "")
  const isDevelopmentContent =
    /(^|\/)(test|tests|testing|showcase)(\/|$)/i.test(`${slug}/${filePath}/${title}`) ||
    tags.some((tag) => /^(test|testing|showcase)$/i.test(String(tag)))

  return (
    writingTypes.has(type) &&
    slug !== "index" &&
    !slug.startsWith("tags/") &&
    !slug.endsWith("/index") &&
    filePath.toLowerCase().endsWith(".md") &&
    frontmatter?.draft !== true &&
    page.unlisted !== true &&
    !isDevelopmentContent
  )
}

function getPublishedDate(page: QuartzComponentProps["allFiles"][number]): number {
  const dates = page.dates as { published?: Date } | undefined
  return dates?.published?.getTime() ?? 0
}

const StartHere: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "index") return null

  const page = [...allFiles].filter(isPublicWriting).sort((first, second) => {
    const dateDifference = getPublishedDate(second) - getPublishedDate(first)
    if (dateDifference !== 0) return dateDifference

    const firstTitle = String(first.frontmatter?.title ?? "")
    const secondTitle = String(second.frontmatter?.title ?? "")
    return firstTitle.localeCompare(secondTitle)
  })[0]

  if (!page) return null

  const frontmatter = page.frontmatter as Record<string, unknown> | undefined
  const title = String(frontmatter?.title ?? "Untitled")
  const description = String(frontmatter?.description ?? page.description ?? "").trim()
  const href = resolveRelative(fileData.slug as FullSlug, page.slug as FullSlug)

  return (
    <section class="homepage-start-here" aria-labelledby="homepage-start-here-title">
      <h2 id="homepage-start-here-title">Start here</h2>
      <div class="homepage-start-here-entry">
        <h3>
          <a class="internal internal-link" href={href}>
            {title}
          </a>
        </h3>
        {description && <p>{description}</p>}
        <a class="homepage-start-here-read internal internal-link" href={href}>
          Read
        </a>
      </div>
      <p class="homepage-start-here-network">
        The writing is meant to grow as a connected set of ideas. <a class="internal internal-link" href={resolveRelative(fileData.slug as FullSlug, "notes/Building a Knowledge Network" as FullSlug)}>See how the network works.</a>
      </p>
    </section>
  )
}

StartHere.css = `
.homepage-start-here {
  margin-top: var(--site-space-8);
  padding-top: var(--site-space-6);
  padding-bottom: var(--site-space-5);
  border-top: 1px solid var(--site-border);
  border-bottom: 1px solid var(--site-border);
}

.homepage-start-here h2 {
  margin-top: 0;
  margin-bottom: var(--site-space-5);
}

.homepage-start-here-entry h3 {
  margin-top: 0;
  font-size: clamp(1.45rem, 2.5vw, 1.8rem);
}

.homepage-start-here-entry p {
  max-width: var(--site-content-measure);
  color: var(--site-muted);
}

.homepage-start-here-read {
  display: inline-block;
  margin-top: var(--site-space-2);
  color: var(--site-primary);
  font-family: var(--headerFont);
  font-weight: 600;
}

.homepage-start-here-network {
  max-width: 65ch;
  margin: var(--site-space-6) 0 0;
  color: var(--site-muted);
  font-size: 0.92rem;
}
`

export default (() => StartHere) satisfies QuartzComponentConstructor
