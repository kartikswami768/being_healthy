import { QuartzComponent, QuartzComponentConstructor } from "./types"

const EXPLORER_SELECTOR = ".explorer"
const TOGGLE_SELECTOR = ".explorer-toggle, .mobile-explorer-trigger"

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

ExplorerToggle.afterDOMLoaded = `
  (() => {
    const syncExplorerState = (explorer, buttons) => {
      const hidden = explorer.hidden || explorer.getAttribute("aria-hidden") === "true"
      buttons.forEach((button) => {
        button.setAttribute("aria-expanded", hidden ? "false" : "true")
      })
    }

    const bind = () => {
      const explorer = document.querySelector(EXPLORER_SELECTOR)
      if (!explorer) return

      explorer.id = "notebook-explorer"
      explorer.setAttribute("aria-label", "Notebook explorer")

      const buttons = Array.from(document.querySelectorAll(TOGGLE_SELECTOR))
      buttons.forEach((button) => {
        if (button.dataset.explorerToggleBound === "true") return
        button.dataset.explorerToggleBound = "true"
        button.setAttribute("aria-controls", "notebook-explorer")

        button.addEventListener("click", () => {
          const hidden = explorer.hidden || explorer.getAttribute("aria-hidden") === "true"
          explorer.hidden = !hidden
          explorer.setAttribute("aria-hidden", hidden ? "false" : "true")
          syncExplorerState(explorer, buttons)
        })
      })

      syncExplorerState(explorer, buttons)
    }

    bind()
  })()
`

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
  cursor: pointer;
}

@media all and (min-width: 801px) and (max-width: 1200px) {
  .explorer-toggle {
    display: inline-flex;
    margin-bottom: var(--site-space-3);
  }
}
`

export default (() => ExplorerToggle) satisfies QuartzComponentConstructor
