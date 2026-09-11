import { FullSlug, resolveRelative } from "../util/path"
import { Date as DateComponent } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const writingTypes = [
  { key: "question", title: "Everyday Questions", slug: "questions", description: "Questions about health, the body, food, exercise, habits, and things people encounter in ordinary life." },
  { key: "essay", title: "Essays", slug: "essays", description: "Longer explorations of health, medicine, psychology, behaviour, and ideas that deserve more than a quick answer." },
  { key: "case", title: "Case Stories", slug: "cases", description: "Interesting medical cases and the reasoning behind them: what makes them puzzling, instructive, or memorable." },
  { key: "note", title: "Notes & Observations", slug: "notes", description: "Shorter thoughts, observations, and pieces of learning that do not need to become a full essay." },
] as const

type WritingPage = QuartzComponentProps["allFiles"][number]

type WritingType = (typeof writingTypes)[number]

function getFrontmatter(page: WritingPage): Record<string, unknown> {
  return (page.frontmatter as Record<string, unknown> | undefined) ?? {}
}

function getPublishedDate(page: WritingPage): globalThis.Date | undefined {
  if (!getFrontmatter(page).published) return undefined
  const dates = page.dates as { published?: globalThis.Date } | undefined
  return dates?.published
}

function isPublicWriting(page: WritingPage): boolean {
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

function sortByPublishedDate(first: WritingPage, second: WritingPage): number {
  const firstDate = getPublishedDate(first)?.getTime() ?? 0
  const secondDate = getPublishedDate(second)?.getTime() ?? 0
  if (firstDate !== secondDate) return secondDate - firstDate

  const firstTitle = String(getFrontmatter(first).title ?? "")
  const secondTitle = String(getFrontmatter(second).title ?? "")
  return firstTitle.localeCompare(secondTitle)
}

const WritingArchive: QuartzComponent = ({ allFiles, fileData }) => {
  const slug = String(fileData.slug ?? "")
  const writingType = writingTypes.find((entry) => slug === `blog/${entry.slug}`) as WritingType | undefined

  if (!writingType) return null

  const pages = allFiles
    .filter(isPublicWriting)
    .filter((page) => getFrontmatter(page).type === writingType.key)
    .sort(sortByPublishedDate)

  return (
    <div class="writing-archive" aria-label={`${writingType.title} archive`}>
      <p class="writing-archive-description">{writingType.description}</p>
      {pages.length > 0 ? (
        <ul class="writing-archive-items">
          {pages.map((page) => {
            const frontmatter = getFrontmatter(page)
            const title = String(frontmatter.title ?? "Untitled")
            const description = String(frontmatter.description ?? page.description ?? "").trim()
            const publishedDate = getPublishedDate(page)
            const href = resolveRelative(fileData.slug as FullSlug, page.slug as FullSlug)

            return (
              <li class="writing-archive-item" key={page.slug as string}>
                <h2>
                  <a class="internal internal-link" href={href}>
                    {title}
                  </a>
                </h2>
                {description && <p class="writing-archive-item-description">{description}</p>}
                {publishedDate && (
                  <p class="writing-archive-date">
                    <DateComponent date={publishedDate} locale={"en-US"} />
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p class="writing-archive-empty">There is nothing here yet.</p>
      )}
    </div>
  )
}

WritingArchive.css = `
.writing-archive {
  max-width: var(--site-content-measure);
  margin-top: var(--site-space-6);
}

.writing-archive-description {
  max-width: 65ch;
  color: var(--site-muted);
}

.writing-archive-items {
  list-style: none;
  margin: var(--site-space-7) 0 0;
  padding: 0;
}

.writing-archive-item {
  margin: 0;
  padding: var(--site-space-6) 0;
  border-top: 1px solid var(--site-border);
}

.writing-archive-item h2 {
  margin: 0;
}

.writing-archive-item-description {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
}

.writing-archive-date {
  margin: var(--site-space-2) 0 0;
  color: var(--site-muted);
  font-family: var(--codeFont);
  font-size: 0.72rem;
}

.writing-archive-empty {
  margin-top: var(--site-space-7);
  color: var(--site-muted);
}
`

export default (() => WritingArchive) satisfies QuartzComponentConstructor
