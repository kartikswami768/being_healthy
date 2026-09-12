import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Navigation from "./Navigation"
import Profile from "./Profile"

const MobileHeader: QuartzComponent = (props: QuartzComponentProps) => {
  return (
    <div class="mobile-header">
      <Navigation {...props} />
      <Profile {...props} />
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
    gap: var(--site-space-4);
    width: 100%;
  }
}
`

export default (() => MobileHeader) satisfies QuartzComponentConstructor
