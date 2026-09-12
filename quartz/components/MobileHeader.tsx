import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Navigation from "./Navigation"
import Profile from "./Profile"

type MobileHeaderProps = QuartzComponentProps & {
  children?: QuartzComponentProps["children"]
}

const MobileHeader: QuartzComponent = (props: MobileHeaderProps) => {
  const { children } = props

  return (
    <div class="mobile-header">
      <div class="mobile-header-main">
        <Profile {...props} />
        <Navigation {...props} />
      </div>
      {children && <div class="mobile-header-sidebar">{children}</div>}
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
