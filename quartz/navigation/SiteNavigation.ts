import type { QuartzPluginData } from "../plugins/vfile"
import { writingTypes } from "./WritingTypes"

export type NavigationLink = {
  label: string
  href: string
  current?: boolean
}

export type SiteNavigation = {
  primary: NavigationLink[]
  writing: NavigationLink[]
  startHere: NavigationLink[]
  recent: NavigationLink[]
}

function isPublicWriting(file: QuartzPluginData): boolean {
  const slug = String(file.slug ?? "")
  const frontmatter = file.frontmatter as Record<string, any> | undefined
  const type = frontmatter?.type

  return (
    Boolean(slug) &&
    !frontmatter?.draft &&
    !frontmatter?.unlisted &&
    writingTypes.some((entry) => entry.key === type) &&
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
  const files = allFiles.filter(isPublicWriting)

  const primary: NavigationLink[] = [
    { label: "Home", href: "/", current: current === "index" },
    { label: "Blog", href: "/blog", current: current === "blog" || current === "blog/index" },
    { label: "About", href: "/about", current: current === "about" || current === "about/index" },
  ]

  const writing: NavigationLink[] = writingTypes.map(({ title, slug }) => ({
    label: title,
    href: `/blog/${slug}`,
    current: current === `blog/${slug}`,
  }))

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

  return { primary, writing, startHere, recent }
}
