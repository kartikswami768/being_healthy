import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import type { FullPageLayout } from "../cfg"

type MobileHeaderProps = QuartzComponentProps & {
  mobileHeader?: FullPageLayout["mobileHeader"]
}

const MobileHeader: QuartzComponent = (props: MobileHeaderProps) => {
  const { mobileHeader } = props
  const utilities = mobileHeader?.utilities ?? []

  return (
    <div class="mobile-header">
      <div class="site-header-brand" aria-label="Notes on Being Human">
        Notes on Being Human
      </div>

      <div class="mobile-header-profile">
        {mobileHeader?.profile && <mobileHeader.profile {...props} />}
      </div>

      <div class="mobile-header-toolbar">
        <div class="mobile-header-utilities">
          {utilities.map((Component) => (
            <Component {...props} />
          ))}
        </div>

        <span class="mobile-header-divider" aria-hidden="true"></span>

        {mobileHeader?.navigation && <mobileHeader.navigation {...props} />}
      </div>
    </div>
  )
}

MobileHeader.css = `
.mobile-header {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 2rem;
  padding: 0 0 1rem;
  border-bottom: 1px solid var(--site-border);
  background: var(--site-canvas);
}

.site-header-brand {
  flex: 0 0 auto;
  color: var(--site-heading);
  font-family: var(--headerFont);
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

.mobile-header-profile,
.mobile-header-utilities,
.mobile-header-divider {
  display: none;
}

.mobile-header-toolbar {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  margin-left: auto;
}

.mobile-header-toolbar > .primary-navigation {
  width: 100%;
}

@media all and (min-width: 801px) {
  .center > .page-header {
    margin-top: 2rem !important;
    padding-top: 0 !important;
  }

  .center > .page-header > header {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .left.sidebar,
  .right.sidebar {
    padding-top: 2rem !important;
  }

  .left.sidebar {
    padding-right: 1rem !important;
  }
}

@media all and (max-width: 800px) {
  .center > .page-header {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .center > .page-header > header {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  .mobile-header {
    width: calc(100% + 2rem);
    margin-left: -1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem 1rem 0.9rem;
    border-bottom: 1px solid var(--site-sage-border);
    background: var(--site-sage-pale);
  }

  .site-header-brand {
    display: none;
  }

  .mobile-header-profile {
    display: block;
    width: 100%;
    padding: 0;
  }

  .mobile-header .mobile-header-profile .profile {
    margin: 0;
    padding: 0;
    border: 0;
  }

  .mobile-header-profile .profile-site-title {
    margin-bottom: 0.7rem;
    color: var(--site-primary);
    font-size: 1.45rem;
  }

  .mobile-header-profile .profile img {
    display: none;
  }

  .mobile-header-profile .profile-name {
    font-size: 0.88rem;
  }

  .mobile-header-profile .profile-role {
    font-size: 0.7rem;
  }

  .mobile-header-toolbar {
    gap: 0.75rem;
    flex: 0 0 auto;
  }

  .mobile-header-utilities {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 0 0 auto;
  }

  .mobile-header-divider {
    display: block;
    width: 1px;
    height: 1.5rem;
    flex: 0 0 auto;
    background: var(--site-sage-border);
  }

  .mobile-header-toolbar > .primary-navigation {
    width: auto;
    min-width: 0;
    margin-left: 0;
    justify-content: flex-start;
    flex: 1 1 auto;
  }

  .mobile-header-toolbar .primary-navigation-links {
    flex-wrap: nowrap;
    gap: 0.9rem;
  }

  .mobile-header-toolbar .primary-navigation-link {
    padding: 0;
  }
}

@media all and (max-width: 340px) {
  .mobile-header {
    width: calc(100% + 1.5rem);
    margin-left: -0.75rem;
    gap: 0.55rem;
    padding: 0.75rem 0.75rem 0.7rem;
  }

  .mobile-header-toolbar {
    gap: 0.55rem;
  }

  .mobile-header-utilities {
    gap: 0.3rem;
  }

  .mobile-header-toolbar .primary-navigation-links {
    gap: 0.55rem;
  }
}
`

export default (() => MobileHeader) satisfies QuartzComponentConstructor
