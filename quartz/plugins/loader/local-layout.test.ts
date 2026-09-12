import test, { afterEach, describe } from "node:test"
import assert from "node:assert"
import { buildLayoutForEntries } from "./config-loader"
import { componentRegistry } from "../../components/registry"
import type { QuartzComponent, QuartzComponentConstructor } from "../../components/types"
import type { PluginJsonEntry } from "./types"

const makeComponent = (name: string): QuartzComponent => {
  const component = (() => null) as unknown as QuartzComponent
  component.displayName = name
  return component
}

const makeConstructor = (name: string): QuartzComponentConstructor => {
  return () => makeComponent(name)
}

const makeEntry = (source: string, priority: number): PluginJsonEntry => ({
  source,
  enabled: true,
  options: {},
  layout: {
    position: "left",
    priority,
    mobileHeader: true,
  },
})

afterEach(() => {
  componentRegistry.clear()
})

describe("local layout composition", () => {
  test("adds only explicitly managed local components and composes MobileHeader dependencies", () => {
    const profile = makeComponent("Profile")
    const navigation = makeComponent("Navigation")
    const search = makeComponent("Search")
    const mobileHeader = makeConstructor("MobileHeader")
    const blogList = makeComponent("BlogList")

    componentRegistry.register("profile", profile, "local", {
      name: "profile",
      displayName: "Profile",
      description: "",
      version: "1",
      defaultPosition: "left",
      defaultPriority: 5,
      layoutManaged: true,
      mobileHeaderRole: "profile",
    })
    componentRegistry.register("navigation", navigation, "local", {
      name: "navigation",
      displayName: "Navigation",
      description: "",
      version: "1",
      mobileHeaderRole: "navigation",
    })
    componentRegistry.register("mobile-header", mobileHeader, "local", {
      name: "mobile-header",
      displayName: "Mobile Header",
      description: "",
      version: "1",
      defaultPosition: "header",
      defaultPriority: 5,
      layoutManaged: true,
    })
    componentRegistry.register("blog-list", blogList, "local", {
      name: "blog-list",
      displayName: "Blog List",
      description: "",
      version: "1",
    })
    componentRegistry.register("search", search, "test-source")

    const result = buildLayoutForEntries([makeEntry("search", 20)], {})

    assert.deepStrictEqual(result.left, [profile, search])
    assert.strictEqual(result.header?.length, 1)
    assert.strictEqual(result.left?.includes(blogList), false)
    assert.strictEqual(result.mobileHeader?.profile, profile)
    assert.strictEqual(result.mobileHeader?.navigation, navigation)
    assert.deepStrictEqual(result.mobileHeader?.utilities, [search])
  })
})
