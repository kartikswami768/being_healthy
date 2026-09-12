import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const FrontmatterDebug: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const frontmatter = fileData.frontmatter
  if (!frontmatter) return null

  return (
    <pre data-frontmatter-debug>
      {JSON.stringify(frontmatter, null, 2)}
    </pre>
  )
}

export default (() => FrontmatterDebug) satisfies QuartzComponentConstructor
