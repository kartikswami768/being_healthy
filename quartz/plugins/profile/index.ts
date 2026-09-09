import Profile from "../../components/Profile"

export const manifest = {
  name: "profile",
  displayName: "Profile",
  description: "Displays the author's profile.",
  version: "1.0.0",
  category: "component",
  components: {
    Profile: {
      name: "Profile",
      displayName: "Profile",
      description: "Author profile component.",
      version: "1.0.0",
      defaultPosition: "left",
      defaultPriority: 5,
    },
  },
}

export { Profile }