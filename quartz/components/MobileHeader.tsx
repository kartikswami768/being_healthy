import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import type { FullPageLayout } from "../cfg"

type MobileHeaderProps = QuartzComponentProps & {
  mobileHeader?: FullPageLayout["mobileHeader"]
}

const MobileHeader: QuartzComponent = (props: MobileHeaderProps) => {
  const { mobileHeader } = props
  const sidebar = mobileHeader?.sidebar ?? []

  return (
    <div class="mobile-header">
      <div class="mobile-header-main">
        {mobileHeader?.profile && <mobileHeader.profile {...props} />}
        {mobileHeader?.navigation && <mobileHeader.navigation {...props} />}
      </div>
      {sidebar.length > 0 && (
        <div class="mobile-header-sidebar">
          {sidebar.map((Component) => (
            <Component {...props} />
          ))}
        </div>
      )}
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
    gap: 1rem;
  }

  .mobile-header-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }

  .mobile-header-sidebar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
  }
}
`

export default (() => MobileHeader) satisfies QuartzComponentConstructor
