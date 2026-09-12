import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import BlogList from "./quartz/components/BlogList"
import MobileHeader from "./quartz/components/MobileHeader"
import Navigation from "./quartz/components/Navigation"
import NotebookMark from "./quartz/components/NotebookMark"
import Profile from "./quartz/components/Profile"
import StartHere from "./quartz/components/StartHere"
import WritingArchive from "./quartz/components/WritingArchive"

componentRegistry.register("blog-list", BlogList, "local", {
  name: "blog-list",
  displayName: "Blog List",
  description: "Displays recent public writing grouped by type on the blog page.",
  version: "1.0.0",
  defaultPosition: "afterBody",
  defaultPriority: 30,
})

componentRegistry.register("mobile-header", MobileHeader, "local", {
  name: "mobile-header",
  displayName: "Mobile Header",
  description: "Displays the primary navigation, profile, and mobile sidebar controls.",
  version: "1.0.0",
  defaultPosition: "header",
  defaultPriority: 5,
  layoutManaged: true,
})

componentRegistry.register("navigation", Navigation, "local", {
  name: "navigation",
  displayName: "Navigation",
  description: "Displays the primary site navigation.",
  version: "1.0.0",
  defaultPosition: "header",
  defaultPriority: 10,
  mobileHeaderRole: "navigation",
})

componentRegistry.register("notebook-mark", NotebookMark, "local", {
  name: "notebook-mark",
  displayName: "Notebook Mark",
  description: "Displays a small notebook-style decorative mark.",
  version: "1.0.0",
  defaultPosition: "afterBody",
  defaultPriority: 15,
})

componentRegistry.register("profile", Profile, "local", {
  name: "profile",
  displayName: "Profile",
  description: "Displays the author's profile.",
  version: "1.0.0",
  defaultPosition: "left",
  defaultPriority: 5,
  layoutManaged: true,
  mobileHeaderRole: "profile",
})

componentRegistry.register("start-here", StartHere, "local", {
  name: "start-here",
  displayName: "Start Here",
  description: "Displays the explicitly marked starting point and recent writing on the homepage.",
  version: "1.0.0",
  defaultPosition: "afterBody",
  defaultPriority: 20,
})

componentRegistry.register("writing-archive", WritingArchive, "local", {
  name: "writing-archive",
  displayName: "Writing Archive",
  description: "Displays a complete archive for one writing type.",
  version: "1.0.0",
  defaultPosition: "afterBody",
  defaultPriority: 30,
})

const config = await loadQuartzConfig()
const layout = await loadQuartzLayout()

export default config
export { layout }
