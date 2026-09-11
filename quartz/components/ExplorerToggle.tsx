import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExplorerToggle: QuartzComponent = () => {
  return (
    <button
      class="explorer-toggle"
      type="button"
      aria-controls="notebook-explorer"
      aria-expanded="true"
    >
      <span aria-hidden="true">☰</span>
      <span>Notebook</span>
    </button>
  )
}

ExplorerToggle.css = `
.explorer-toggle {
  display: none;
  align-items: center;
  gap: var(--site-space-2);
  padding: var(--site-space-2) var(--site-space-3);
  border: 1px solid var(--site-border);
  border-radius: var(--site-radius-md);
  background: transparent;
  color: var(--site-heading);
  font-family: var(--headerFont);
  font-size: 0.88rem;
  font-weight: 600;
}

@media all and (min-width: 801px) and (max-width: 1200px) {
  .explorer-toggle {
    display: inline-flex;
    margin-bottom: var(--site-space-3);
  }
}
`

export default (() => ExplorerToggle) satisfies QuartzComponentConstructor
