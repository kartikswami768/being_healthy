import type { QuartzPluginData } from "../plugins/vfile"

export type NavigationLink = {
  label: string
  href: string
  current?: boolean
}

export type SiteNavigation = {
  primary: NavigationLink[]
  writing: NavigationLink[]
  topics: NavigationLink[]
  startHere: NavigationLink[]
  recent: NavigationLink[]
}

const writingTypes = [
  { type: "essay", label: "Essays", href: "/blog/essays" },
  { type: "question", label: "Questions", href: "/blog/questions" },
  { type: "case", label: "Cases", href: "/blog/cases" },
  { type: "note", label: "Notes", href: "/blog/notes" },
]

function isPublicWriting(file: QuartzPluginData): boolean {
  const slug = String(file.slug ?? "")
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  const type = frontmatter?.type
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []

  return (
    Boolean(slug) &&
    !frontmatter?.draft &&
    !frontmatter?.unlisted &&
    writingTypes.some((entry) => entry.type === type) &&
    !slug.startsWith("blog/") ||
    false
  )
}

function isPublicWritingCorrected(file: QuartzPluginData): boolean {
  const slug = String(file.slug ?? "")
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  const type = frontmatter?.type
  return (
    Boolean(slug) &&
    !frontmatter?.draft &&
    !frontmatter?.unlisted &&
    writingTypes.some((entry) => entry.type === type) &&
    slug !== "index" &&
    !slug.startsWith("blog/")
  )
}

function labelFor(file: QuartzPluginData): string {
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  return String(frontmatter?.title ?? file.slug ?? "Untitled")
}

function dateFor(file: QuartzPluginData): number {
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  const published = frontmatter?.published
  const timestamp = published ? Date.parse(String(published)) : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function hasStartHereTag(file: QuartzPluginData): boolean {
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
  return tags.some((tag: unknown) => String(tag).toLowerCase() === "start-here")
}

export function buildSiteNavigation(
  allFiles: QuartzPluginData[],
  currentSlug = "",
): SiteNavigation {
  const current = String(currentSlug).replace(/^\//, "")
  const files = allFiles.filter(isPublicWritingCorrected)

  const primary: NavigationLink[] = [
    { label: "Home", href: "/", current: current === "index" },
    { label: "Blog", href: "/blog", current: current === "blog" || current === "blog/index" },
    { label: "About", href: "/about", current: current === "about" || current === "about/index" },
  ]

  const writing: NavigationLink[] = writingTypes
    .filter(({ type }) => files.some((file) => (file.frontmatter as any)?.type === type))
    .map(({ label, href }) => ({ label, href, current: current === href.slice(1) }))

  const topics = new Map<string, string>()
  for (const file of files) {
    const frontmatter = file.frontmatter as Record<string, any> | undefined
    const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
    for (const tag of tags) {
      const value = String(tag).trim()
      if (!value || value.toLowerCase() === "start-here") continue
      const label = value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      topics.set(value.toLowerCase(), label)
    }
  }

  const topicLinks: NavigationLink[] = Array.from(topics.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([slug, label]) => ({ label, href: `/tags/${slug}` }))

  const recent = [...files]
    .sort((a, b) => dateFor(b) - dateFor(a))
    .slice(0, 5)
    .map((file) => ({
      label: labelFor(file),
      href: `/${String(file.slug).replace(/^\//, "")}`,
    }))

  const startHere = files
    .filter(hasStartHereTag)
    .sort((a, b) => dateFor(b) - dateFor(a))
    .map((file) => ({
      label: labelFor(file),
      href: `/${String(file.slug).replace(/^\//, "")}`,
    }))

  return { primary, writing, topics: topicLinks, startHere, recent }
}

export function isPublicWritingFile(file: QuartzPluginData): boolean {
  return isPublicWritingCorrected(file)
}
