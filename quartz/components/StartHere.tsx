import { FullSlug, resolveRelative } from "../util/path"
import { Date as DateComponent } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const writingTypes = new Set(["question", "essay", "case", "note"])
const homepageRecentCount = 3

type WritingPage = QuartzComponentProps["allFiles"][number]

function getFrontmatter(page: WritingPage): Record<string, unknown> {
  return (page.frontmatter as Record<string, unknown> | undefined) ?? {}
}

function isPublicWriting(page: WritingPage): boolean {
  const frontmatter = getFrontmatter(page)
  const type = String(frontmatter.type ?? "")
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []
  const slug = String(page.slug ?? "")
  const filePath = String(page.filePath ?? "")
  const title = String(frontmatter.title ?? "")
  const isDevelopmentContent =
    /(^|\/)(test|tests|testing|showcase)(\/|$)/i.test(`${slug}/${filePath}/${title}`) ||
    tags.some((tag) => /^(test|testing|showcase)$/i.test(String(tag)))

  return (
    writingTypes.has(type) &&
    slug !== "index" &&
    !slug.startsWith("tags/") &&
    !slug.endsWith("/index") &&
    filePath.toLowerCase().endsWith(".md") &&
    frontmatter.draft !== true &&
    page.unlisted !== true &&
    !isDevelopmentContent
  )
}

function getPublishedDate(page: WritingPage): number {
  const dates = page.dates as { published?: Date } | undefined
  return dates?.published?.getTime() ?? 0
}

function sortByPublishedDate(first: WritingPage, second: WritingPage): number {
  const dateDifference = getPublishedDate(second) - getPublishedDate(first)
  if (dateDifference !== 0) return dateDifference

  const firstTitle = String(getFrontmatter(first).title ?? "")
  const secondTitle = String(getFrontmatter(second).title ?? "")
  return firstTitle.localeCompare(secondTitle)
}

const StartHere: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "index") return null

  const pages = [...allFiles].filter(isPublicWriting).sort(sortByPublishedDate)
  const startPage = pages[0]
  if (!startPage) return null

  const startFrontmatter = getFrontmatter(startPage)
  const startTitle = String(startFrontmatter.title ?? "Untitled")
  const startDescription = String(startFrontmatter.description ?? startPage.description ?? "").trim()
  const startHref = resolveRelative(fileData.slug as FullSlug, startPage.slug as FullSlug)
  const recentPages = pages.slice(0, homepageRecentCount)

  return (
    <section class="homepage-start-here" aria-labelledby="homepage-start-here-title">
      <div class="homepage-start-here-primary">
        <h2 id="homepage-start-here-title">Start here</h2>
        <div class="homepage-start-here-entry">
          <h3>
            <a class="internal internal-link" href={startHref}>
              {startTitle}
            </a>
          </h3>
          {startDescription && <p>{startDescription}</p>}
          <a class="homepage-start-here-read internal internal-link" href={startHref}>
            Read
          </a>
        </div>
      </div>

      <div class="homepage-recent" aria-labelledby="homepage-recent-title">
        <div class="homepage-section-heading">
          <h2 id="homepage-recent-title">Recent writing</h2>
          <a class="homepage-section-link internal internal-link" href={resolveRelative(fileData.slug as FullSlug, "blog" as FullSlug)}>
            Browse all
          </a>
        </div>
        <ol class="homepage-recent-list">
          {recentPages.map((page) => {
            const frontmatter = getFrontmatter(page)
            const title = String(frontmatter.title ?? "Untitled")
            const description = String(frontmatter.description ?? page.description ?? "").trim()
            const publishedDate = (page.dates as { published?: Date } | undefined)?.published
            const href = resolveRelative(fileData.slug as FullSlug, page.slug as FullSlug)

            return (
              <li class="homepage-recent-item" key={page.slug as string}>
                <div>
                  <h3>
                    <a class="internal internal-link" href={href}>
                      {title}
                    </a>
                  </h3>
                  {description && <p>{description}</p>}
                </div>
                {publishedDate && <DateComponent date={publishedDate} locale={"en-US"} />}
              </li>
            )
          })}
        </ol>
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

.homepage-start-here-primary {
  padding-bottom: var(--site-space-6);
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

.homepage-recent {
  padding-top: var(--site-space-6);
  border-top: 1px solid var(--site-border);
}

.homepage-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--site-space-4);
}

.homepage-section-heading h2 {
  margin-bottom: 0;
}

.homepage-section-link {
  color: var(--site-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

.homepage-recent-list {
  margin: var(--site-space-5) 0 0;
  padding-left: 1.3rem;
}

.homepage-recent-item {
  margin: var(--site-space-5) 0;
  padding-left: var(--site-space-2);
}

.homepage-recent-item h3 {
  margin: 0;
}

.homepage-recent-item p {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
}

.homepage-recent-item time {
  display: inline-block;
  margin-top: var(--site-space-2);
  color: var(--site-muted);
  font-family: var(--codeFont);
  font-size: 0.72rem;
}

.homepage-start-here-network {
  max-width: 65ch;
  margin: var(--site-space-6) 0 0;
  color: var(--site-muted);
  font-size: 0.92rem;
}

@media all and (max-width: 600px) {
  .homepage-section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--site-space-1);
  }
}
`

export default (() => StartHere) satisfies QuartzComponentConstructor
