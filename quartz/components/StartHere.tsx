import { FullSlug, resolveRelative } from "../util/path"
import { Date as DateComponent } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const writingTypes = new Set(["question", "essay", "case", "note"])
const homepageRecentCount = 3
const startHereTag = "start-here"

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

function isStartHere(page: WritingPage): boolean {
  const tags = getFrontmatter(page).tags
  return Array.isArray(tags) && tags.some((tag) => String(tag).toLowerCase() === startHereTag)
}

const StartHere: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "index") return null

  const pages = [...allFiles].filter(isPublicWriting).sort(sortByPublishedDate)
  const startPage = pages.find(isStartHere)
  const recentPages = pages
    .slice(0, homepageRecentCount)
    .filter((page) => page.slug !== startPage?.slug)

  return (
    <section class="homepage-start-here" aria-labelledby="homepage-start-here-title">
      {startPage ? (
        <div class="homepage-start-here-primary">
          <div class="homepage-section-heading">
            <div>
              <p class="homepage-eyebrow">A good place to begin</p>
              <h2 id="homepage-start-here-title">Start here</h2>
            </div>
          </div>
          <div class="homepage-start-here-entry">
            {(() => {
              const frontmatter = getFrontmatter(startPage)
              const title = String(frontmatter.title ?? "Untitled")
              const description = String(
                frontmatter.description ?? startPage.description ?? "",
              ).trim()
              const href = resolveRelative(fileData.slug as FullSlug, startPage.slug as FullSlug)

              return (
                <>
                  <h3>
                    <a class="internal internal-link" href={href}>
                      {title}
                    </a>
                  </h3>
                  {description && <p>{description}</p>}
                  <a class="homepage-start-here-read internal internal-link" href={href}>
                    Read the note →
                  </a>
                </>
              )
            })()}
          </div>
        </div>
      ) : null}

      {recentPages.length > 0 && (
        <div class="homepage-recent" aria-labelledby="homepage-recent-title">
          <div class="homepage-section-heading">
            <div>
              <p class="homepage-eyebrow">What I've been writing</p>
              <h2 id="homepage-recent-title">Recent writing</h2>
            </div>
            <a
              class="homepage-section-link internal internal-link"
              href={resolveRelative(fileData.slug as FullSlug, "blog" as FullSlug)}
            >
              Browse all
            </a>
          </div>
          <ol class="homepage-recent-list">
            {recentPages.map((page, index) => {
              const frontmatter = getFrontmatter(page)
              const title = String(frontmatter.title ?? "Untitled")
              const description = String(frontmatter.description ?? page.description ?? "").trim()
              const publishedDate = (page.dates as { published?: Date } | undefined)?.published
              const href = resolveRelative(fileData.slug as FullSlug, page.slug as FullSlug)

              return (
                <li class="homepage-recent-item" key={page.slug as string}>
                  <span class="homepage-recent-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>
                      <a class="internal internal-link" href={href}>
                        {title}
                      </a>
                    </h3>
                    {description && <p>{description}</p>}
                    {publishedDate && <DateComponent date={publishedDate} locale={"en-US"} />}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <p class="homepage-start-here-network">
        The writing is meant to grow as a connected set of ideas.{" "}
        <a
          class="internal internal-link"
          href={resolveRelative(
            fileData.slug as FullSlug,
            "notes/building-a-knowledge-network" as FullSlug,
          )}
        >
          See how the network works.
        </a>
      </p>
    </section>
  )
}

StartHere.css = `
.homepage-start-here {
  margin-top: var(--site-space-8);
  padding-top: var(--site-space-7);
  border-top: 1px solid var(--site-border);
}

.homepage-start-here-primary {
  padding: var(--site-space-6);
  border: 1px solid var(--site-sage-border);
  border-radius: var(--site-radius-lg);
  background: var(--site-sage-surface);
}

.homepage-start-here h2,
.homepage-recent h2 {
  margin: 0;
}

.homepage-eyebrow {
  margin: 0 0 var(--site-space-2);
  color: var(--site-sage-deep);
  font-family: var(--headerFont);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.homepage-start-here-entry {
  margin-top: var(--site-space-5);
}

.homepage-start-here-entry h3 {
  margin: 0;
  font-size: clamp(1.45rem, 2.5vw, 1.85rem);
}

.homepage-start-here-entry p {
  max-width: 62ch;
  margin: var(--site-space-3) 0 0;
  color: var(--site-muted);
}

.homepage-start-here-read {
  display: inline-block;
  margin-top: var(--site-space-4);
  color: var(--site-primary);
  font-family: var(--headerFont);
  font-weight: 600;
  text-decoration: none;
}

.homepage-recent {
  margin-top: var(--site-space-8);
  padding-top: var(--site-space-6);
  border-top: 1px solid var(--site-border);
}

.homepage-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--site-space-4);
}

.homepage-section-link {
  color: var(--site-muted);
  font-size: 0.88rem;
  white-space: nowrap;
}

.homepage-recent-list {
  margin: var(--site-space-5) 0 0;
  padding: 0;
  list-style: none;
}

.homepage-recent-item {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: var(--site-space-3);
  margin: 0;
  padding: var(--site-space-4) 0;
  border-top: 1px solid var(--site-border);
}

.homepage-recent-item:last-child {
  border-bottom: 1px solid var(--site-border);
}

.homepage-recent-index {
  padding-top: 0.15rem;
  color: var(--site-sage-deep);
  font-family: var(--codeFont);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.homepage-recent-item h3 {
  margin: 0;
  font-size: 1.12rem;
}

.homepage-recent-item p {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
  font-size: 0.92rem;
}

.homepage-recent-item time {
  display: inline-block;
  margin-top: var(--site-space-2);
  color: var(--site-muted);
  font-family: var(--codeFont);
  font-size: 0.68rem;
}

.homepage-start-here-network {
  max-width: 65ch;
  margin: var(--site-space-6) 0 0;
  color: var(--site-muted);
  font-size: 0.9rem;
}

@media all and (max-width: 800px) {
  .homepage-start-here-primary {
    padding: var(--site-space-4);
  }

  .homepage-recent {
    margin-top: var(--site-space-7);
  }

  .homepage-section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--site-space-2);
  }
}
`

export default (() => StartHere) satisfies QuartzComponentConstructor
