import { QuartzComponent, QuartzComponentConstructor } from "./types"

export type NotebookMarkVariant = "underline" | "arrow" | "bracket"

export interface NotebookMarkOptions {
  variant?: NotebookMarkVariant
}

const notebookMark = (options: NotebookMarkOptions = {}) => {
  const variant = options.variant ?? "underline"

  const NotebookMark: QuartzComponent = ({ fileData }) => {
    const pageVariant =
      fileData.slug === "index" ? variant : fileData.slug === "blog" ? "bracket" : null
    if (!pageVariant) return null

    return (
      <span class={`notebook-mark notebook-mark--${pageVariant}`} aria-hidden="true">
        <svg viewBox={pageVariant === "bracket" ? "0 0 18 64" : "0 0 112 24"} role="presentation">
          {pageVariant === "underline" && (
            <path d="M2 13c18-1 31 1 45 0 13-1 22-2 32-1 9 1 16 3 29 1" />
          )}
          {pageVariant === "arrow" && (
            <>
              <path d="M2 13c23-2 43 2 66 0 12-1 24-2 38-1" />
              <path d="M96 6c3 2 6 4 10 6-3 2-6 5-8 8" />
            </>
          )}
          {pageVariant === "bracket" && <path d="M16 2C8 5 7 12 7 32s1 27 9 30" />}
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

.notebook-mark--bracket {
  width: 1rem;
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
  stroke-width: var(--site-annotation-stroke);
  opacity: var(--site-annotation-opacity);
}

@media all and (max-width: 800px) {
  .notebook-mark {
    width: 6rem;
    margin-top: var(--site-space-5);
  }

  .notebook-mark--bracket {
    width: 0.9rem;
  }
}
`

  return NotebookMark
}

export default notebookMark satisfies QuartzComponentConstructor<NotebookMarkOptions>
