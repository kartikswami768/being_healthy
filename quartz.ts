import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import BlogList from "./quartz/components/BlogList"
import ExplorerToggle from "./quartz/components/ExplorerToggle"
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

componentRegistry.register("explorer-toggle", ExplorerToggle, "local", {
  name: "explorer-toggle",
  displayName: "Explorer Toggle",
  description: "Provides a persistent way to reopen the notebook explorer on tablet layouts.",
  version: "1.0.0",
  defaultPosition: "left",
  defaultPriority: 1,
})

componentRegistry.register("navigation", Navigation, "local", {
  name: "navigation",
  displayName: "Navigation",
  description: "Displays the primary site navigation.",
  version: "1.0.0",
  defaultPosition: "header",
  defaultPriority: 10,
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
export default config

const loadedLayout = await loadQuartzLayout()

function localComponent(name: string) {
  const registered = componentRegistry.get(name)
  if (!registered) throw new Error(`Local component "${name}" is not registered.`)

  if (typeof registered.component !== "function") {
    return registered.component
  }

  return componentRegistry.instantiate(registered.component as any)
}

loadedLayout.defaults.header = [
  localComponent("navigation"),
  ...(loadedLayout.defaults.header ?? []),
]

loadedLayout.defaults.left = [localComponent("profile"), ...(loadedLayout.defaults.left ?? [])]

const header = loadedLayout.defaults.header ?? []
const left = loadedLayout.defaults.left ?? []

loadedLayout.defaults.header = [
  componentRegistry.instantiate((({ ...props }: any) => {
    const HeaderStack = (headerProps: any) => (
      <div class="site-header-stack">
        {header.map((Component: any) => (
          <Component {...headerProps} />
        ))}
        <div class="mobile-header-sidebar">
          {left.map((Component: any) => (
            <Component {...headerProps} />
          ))}
        </div>
      </div>
    )
    return HeaderStack(props)
  }) as any),
]

loadedLayout.defaults.left = []

export const layout = loadedLayout
