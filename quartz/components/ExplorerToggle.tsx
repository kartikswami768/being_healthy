import { QuartzComponent } from "./types"

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

    const explorer = document.querySelector(".explorer")
    if (!explorer) return

    explorer.id = "notebook-explorer"
    const buttons = Array.from(document.querySelectorAll(".explorer-toggle, .mobile-explorer-trigger"))
    if (buttons.length === 0) return

    syncExplorerState(explorer, buttons)

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const currentlyHidden = explorer.hidden || explorer.getAttribute("aria-hidden") === "true"
        explorer.hidden = !currentlyHidden
        explorer.setAttribute("aria-hidden", currentlyHidden ? "false" : "true")
        syncExplorerState(explorer, buttons)
      })
    })
  })()
`

ExplorerToggle.css = `
.explorer-toggle {
  display: none;
}

@media all and (min-width: 801px) and (max-width: 1200px) {
  .explorer-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
}
`

export default ExplorerToggle
