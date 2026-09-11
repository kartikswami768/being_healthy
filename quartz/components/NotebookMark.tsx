import { QuartzComponent, QuartzComponentConstructor } from "./types"

const NotebookMark: QuartzComponent = ({ fileData }) => {
  if (fileData.slug !== "index") return null

  return (
    <span class="notebook-mark" aria-hidden="true">
      <svg viewBox="0 0 112 18" role="presentation">
        <path d="M2 9c18-1 31 1 45 0 13-1 22-2 32-1 9 1 16 3 29 1" />
        <path d="M96 4c3 2 6 3 10 4-3 2-6 4-8 7" />
      </svg>
    </span>
  )
}

NotebookMark.css = `
.notebook-mark {
  display: block;
  width: min(7rem, 100%);
  margin: var(--site-space-6) 0 var(--site-space-2);
  color: var(--site-primary);
  line-height: 0;
}

.notebook-mark svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.notebook-mark path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

@media all and (max-width: 800px) {
  .notebook-mark {
    width: 6rem;
    margin-top: var(--site-space-5);
  }
}
`

export default (() => NotebookMark) satisfies QuartzComponentConstructor
