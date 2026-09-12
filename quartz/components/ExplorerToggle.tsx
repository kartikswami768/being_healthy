import { QuartzComponent } from "./types"

const ExplorerToggle: QuartzComponent = () => {
  return <div class="explorer-toggle" aria-hidden="true" />
}

ExplorerToggle.afterDOMLoaded = `
  (() => {
    const explorer = document.querySelector(".explorer")
    if (!explorer) return

    explorer.id = "notebook-explorer"
    explorer.hidden = false
    explorer.removeAttribute("aria-hidden")
  })()
`

ExplorerToggle.css = `
.explorer-toggle {
  display: none;
}
`

export default ExplorerToggle
