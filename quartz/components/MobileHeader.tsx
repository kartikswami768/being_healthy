import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import type { FullPageLayout } from "../cfg"

type MobileHeaderProps = QuartzComponentProps & {
  mobileHeader?: FullPageLayout["mobileHeader"]
}

const MobileHeader: QuartzComponent = (props: MobileHeaderProps) => {
  const { mobileHeader } = props
  const utilities = mobileHeader?.sidebar ?? []

  return (
    <div class="mobile-header">
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
  display: none;
}

@media all and (max-width: 800px) {
  .mobile-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1.25rem;
  }

  .mobile-header-profile {
    width: 100%;
  }

  .mobile-header-profile .profile {
    margin: 0;
    padding: 0;
    border-bottom: 0;
  }

  .mobile-header-profile .profile img {
    display: none;
  }

  .mobile-header-toolbar {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 1rem;
    min-width: 0;
  }

  .mobile-header-utilities {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
  }

  .mobile-header-divider {
    width: 1px;
    height: 1.5rem;
    flex: 0 0 auto;
    background: var(--lightgray);
  }

  .mobile-header-toolbar > .primary-navigation {
    width: auto;
    min-width: 0;
    margin-left: 0;
    justify-content: flex-end;
    flex: 1 1 auto;
  }

  .mobile-header-toolbar .primary-navigation-links {
    flex-wrap: nowrap;
    gap: 1rem;
  }

  .mobile-header-toolbar .primary-navigation-link {
    padding: 0;
  }
}

@media all and (max-width: 340px) {
  .mobile-header-toolbar {
    gap: 0.65rem;
  }

  .mobile-header-toolbar .primary-navigation-links {
    gap: 0.65rem;
  }
}
`

export default (() => MobileHeader) satisfies QuartzComponentConstructor
