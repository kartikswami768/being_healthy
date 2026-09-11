import { FullSlug, resolveRelative } from "../util/path"
import { Date as DateComponent } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const writingTypes = [
  { key: "question", title: "Everyday Questions" },
  { key: "essay", title: "Essays" },
  { key: "case", title: "Case Stories" },
  { key: "note", title: "Notes & Observations" },
] as const

type BlogPage = QuartzComponentProps["allFiles"][number]

function getFrontmatter(page: BlogPage): Record<string, unknown> {
  return (page.frontmatter as Record<string, unknown> | undefined) ?? {}
}

function getPublishedDate(page: BlogPage): globalThis.Date | undefined {
  const frontmatter = getFrontmatter(page)
  if (!frontmatter.published) return undefined

  const dates = page.dates as { published?: globalThis.Date } | undefined
  return dates?.published
}

function isPublicWriting(page: BlogPage): boolean {
  const frontmatter = getFrontmatter(page)
  const type = frontmatter.type
  const slug = String(page.slug ?? "")
  const filePath = String(page.filePath ?? "")
  const title = String(frontmatter.title ?? "")

  return (
    writingTypes.some((writingType) => writingType.key === type) &&
    slug !== "index" &&
    !slug.startsWith("tags/") &&
    !slug.endsWith("/index") &&
    filePath.toLowerCase().endsWith(".md") &&
    frontmatter.draft !== true &&
    page.unlisted !== true &&
    !/(^|\/)(test|tests|testing|showcase)(\/|$)/i.test(`${slug}/${filePath}/${title}`)
  )
}

function sortByPublishedDate(first: BlogPage, second: BlogPage): number {
  const firstDate = getPublishedDate(first)?.getTime() ?? 0
  const secondDate = getPublishedDate(second)?.getTime() ?? 0
  if (firstDate !== secondDate) return secondDate - firstDate

  const firstTitle = String(getFrontmatter(first).title ?? "")
  const secondTitle = String(getFrontmatter(second).title ?? "")
  return firstTitle.localeCompare(secondTitle)
}

const BlogList: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "blog") return null

  const pages = allFiles.filter(isPublicWriting).sort(sortByPublishedDate)

  return (
    <div class="blog-list" aria-label="Writing by type">
      {writingTypes.map((writingType) => {
        const typePages = pages.filter((page) => getFrontmatter(page).type === writingType.key)

        if (typePages.length === 0) return null

        return (
          <section class="blog-list-section" aria-labelledby={`blog-${writingType.key}`}>
            <h2 id={`blog-${writingType.key}`}>{writingType.title}</h2>
            <ul class="blog-list-items">
              {typePages.map((page) => {
                const frontmatter = getFrontmatter(page)
                const title = String(frontmatter.title ?? "Untitled")
                const description = String(frontmatter.description ?? page.description ?? "").trim()
                const publishedDate = getPublishedDate(page)
                const href = resolveRelative(fileData.slug as FullSlug, page.slug as FullSlug)

                return (
                  <li class="blog-list-item">
                    <h3>
                      <a class="internal internal-link" href={href}>
                        {title}
                      </a>
                    </h3>
                    {description && <p class="blog-list-description">{description}</p>}
                    {publishedDate && (
                      <p class="blog-list-date">
                        <DateComponent date={publishedDate} locale={"en-US"} />
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

BlogList.css = `
.blog-list {
  max-width: var(--site-content-measure);
  margin-top: var(--site-space-7);
}

.blog-list-section {
  margin-top: var(--site-space-7);
  padding-top: var(--site-space-5);
  border-top: 1px solid var(--site-border);
}

.blog-list-section:first-child {
  margin-top: 0;
}

.blog-list-section h2 {
  margin-top: 0;
}

.blog-list-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.blog-list-item {
  margin: var(--site-space-6) 0;
}

.blog-list-item h3 {
  margin: 0;
}

.blog-list-description {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
}

.blog-list-date {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
  font-family: var(--codeFont);
  font-size: 0.72rem;
}
`

export default (() => BlogList) satisfies QuartzComponentConstructor
