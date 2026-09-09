import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import Profile from "./quartz/components/Profile"

componentRegistry.register("profile", Profile, "local", {
  name: "profile",
  displayName: "Profile",
  description: "Displays the author's profile.",
  version: "1.0.0",
  defaultPosition: "left",
  defaultPriority: 5,
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()