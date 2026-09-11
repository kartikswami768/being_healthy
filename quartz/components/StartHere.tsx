import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

function isPublicWriting(page: QuartzComponentProps["allFiles"][number]): boolean {
  const frontmatter = page.frontmatter as Record<string, unknown> | undefined
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
  const slug = String(page.slug ?? "")
  const filePath = String(page.filePath ?? "")
  const title = String(frontmatter?.title ?? "")
  const isDevelopmentContent =
    /(^|\/)(test|tests|testing|showcase)(\/|$)/i.test(`${slug}/${filePath}/${title}`) ||
    tags.some((tag) => /^(test|testing|showcase)$/i.test(String(tag)))

  return (
    slug !== "index" &&
    !slug.startsWith("tags/") &&
    !slug.endsWith("/index") &&
    filePath.toLowerCase().endsWith(".md") &&
    frontmatter?.draft !== true &&
    page.unlisted !== true &&
    !isDevelopmentContent
  )
}

function getDateValue(page: QuartzComponentProps["allFiles"][number]): number {
  const defaultDateType = String(page.defaultDateType ?? "")
  const dates = page.dates as Record<string, Date> | undefined
  return dates?.[defaultDateType]?.getTime() ?? 0
}

const StartHere: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "index") return null

  const page = [...allFiles].filter(isPublicWriting).sort((first, second) => {
    const dateDifference = getDateValue(second) - getDateValue(first)
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
    </section>
  )
}

StartHere.css = `
.homepage-start-here {
  margin-top: var(--site-space-7);
  padding-top: var(--site-space-5);
  border-top: 1px solid var(--site-border);
}

.homepage-start-here h2 {
  margin-top: 0;
}

.homepage-start-here-entry h3 {
  margin-top: 0;
}

.homepage-start-here-entry p {
  max-width: var(--site-content-measure);
  color: var(--site-muted);
}

.homepage-start-here-read {
  display: inline-block;
  margin-top: var(--site-space-2);
}
`

export default (() => StartHere) satisfies QuartzComponentConstructor
