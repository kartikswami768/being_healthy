import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? <header>{children}</header> : null
}

Header.css = `
header {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  margin: 0 0 var(--site-space-5);
  padding: var(--site-space-3) 0 var(--site-space-4);
  border-bottom: 1px solid var(--site-border);
  gap: 1.5rem;
}

header h1 {
  margin: 0;
  flex: auto;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
