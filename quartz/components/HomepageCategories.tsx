import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { writingTypes } from "../navigation/WritingTypes"

const HomepageCategories: QuartzComponent = ({ fileData }) => {
  if (fileData.slug !== "index") return null

  return (
    <section class="homepage-categories" aria-labelledby="homepage-categories-title">
      <div class="homepage-categories-intro">
        <p class="homepage-eyebrow">The writing</p>
        <h2 id="homepage-categories-title">What you'll find here</h2>
        <p>
          A small set of forms for thinking about health, medicine, behaviour, and the ordinary
          details of being human.
        </p>
      </div>

      <div class="homepage-category-grid">
        {writingTypes.map((writingType) => (
          <a
            class="homepage-category-card"
            href={resolveRelative(
              fileData.slug as FullSlug,
              `blog/${writingType.slug}` as FullSlug,
            )}
          >
            <span class="homepage-category-index">
              {String(writingTypes.indexOf(writingType) + 1).padStart(2, "0")}
            </span>
            <h3>{writingType.title}</h3>
            <p>{writingType.description}</p>
          </a>
        ))}
      </div>
    </section>
  )
}

HomepageCategories.css = `
:root {
  --site-sage: var(--tertiary);
  --site-sage-deep: color-mix(in srgb, var(--tertiary) 72%, var(--secondary) 28%);
  --site-sage-pale: color-mix(in srgb, var(--light) 91%, var(--tertiary) 9%);
  --site-sage-surface: color-mix(in srgb, var(--light) 84%, var(--tertiary) 16%);
  --site-sage-hover: color-mix(in srgb, var(--light) 78%, var(--tertiary) 22%);
  --site-sage-border: color-mix(in srgb, var(--tertiary) 45%, var(--lightgray) 55%);
}

.homepage-categories {
  margin-top: var(--site-space-8);
  padding: var(--site-space-6);
  border: 1px solid var(--site-sage-border);
  border-radius: var(--site-radius-lg);
  background: var(--site-sage-pale);
}

.homepage-categories-intro {
  max-width: 60ch;
}

.homepage-eyebrow {
  margin: 0 0 var(--site-space-2);
  color: var(--site-sage-deep);
  font-family: var(--headerFont);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.homepage-categories h2 {
  margin: 0;
  color: var(--site-heading);
}

.homepage-categories-intro > p:last-child {
  margin: var(--site-space-3) 0 0;
  color: var(--site-muted);
}

.homepage-category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--site-space-4);
  margin-top: var(--site-space-6);
}

.homepage-category-card {
  position: relative;
  display: block;
  min-height: 12rem;
  padding: var(--site-space-5);
  border: 1px solid var(--site-sage-border);
  border-radius: var(--site-radius-md);
  background: var(--site-sage-surface);
  color: var(--site-text);
  text-decoration: none;
  transition:
    transform var(--site-transition),
    background-color var(--site-transition),
    border-color var(--site-transition),
    box-shadow var(--site-transition);
}

.homepage-category-card:hover {
  transform: translateY(-2px);
  border-color: var(--site-sage);
  background: var(--site-sage-hover);
  box-shadow: 0 8px 24px rgba(40, 75, 99, 0.08);
}

.homepage-category-index {
  display: block;
  color: var(--site-sage-deep);
  font-family: var(--codeFont);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.homepage-category-card h3 {
  margin: var(--site-space-4) 0 var(--site-space-2);
  color: var(--site-heading);
  font-family: var(--headerFont);
  font-size: 1.25rem;
  line-height: 1.2;
}

.homepage-category-card p {
  margin: 0;
  color: var(--site-muted);
  font-size: 0.92rem;
  line-height: 1.55;
}

@media all and (max-width: 800px) {
  .homepage-categories {
    margin-top: var(--site-space-7);
    padding: var(--site-space-4);
  }

  .homepage-category-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--site-space-3);
    margin-top: var(--site-space-5);
  }

  .homepage-category-card {
    min-height: 0;
    padding: var(--site-space-4);
  }
}
`

export default (() => HomepageCategories) satisfies QuartzComponentConstructor
