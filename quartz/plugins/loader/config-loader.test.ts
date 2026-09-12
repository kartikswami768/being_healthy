import test, { afterEach, describe } from "node:test"
import assert from "node:assert"
import { buildLayoutForEntries } from "./config-loader"
import { componentRegistry } from "../../components/registry"
import type { QuartzComponent, QuartzComponentConstructor } from "../../components/types"
import { LayoutPosition, PluginJsonEntry } from "./types"

const makeComponent = (name: string): QuartzComponent => {
  const c = (() => null) as unknown as QuartzComponent
  c.displayName = name
  return c
}

const makeConstructor = (name: string): QuartzComponentConstructor => {
  return () => makeComponent(name)
}

function makeEntry(source: string, layout?: { position: LayoutPosition; priority: number }): PluginJsonEntry {
  return {
    source,
    enabled: true,
    options: {},
    ...(layout ? { layout: { position: layout.position, priority: layout.priority } } : {}),
  }
}

afterEach(() => {
  componentRegistry.clear()
})

describe("position assignment", () => {
  test("places component in correct position from layout.position", () => {
    const component = makeComponent("MyPlugin")
    componentRegistry.register("my-plugin", component, "test-source")
    const result = buildLayoutForEntries([makeEntry("my-plugin", { position: "left", priority: 10 })], {})
    assert.deepStrictEqual(result.left, [component])
  })

  test("places component in footer position", () => {
    const component = makeComponent("FooterComp")
    componentRegistry.register("footer-comp", component, "test-source")
    const result = buildLayoutForEntries([makeEntry("footer-comp", { position: "footer", priority: 20 })], {})
    assert.deepStrictEqual(result.footer, [component])
  })

  test("places component in header position", () => {
    const component = makeComponent("HeaderComp")
    componentRegistry.register("header-comp", component, "test-source")
    const result = buildLayoutForEntries([makeEntry("header-comp", { position: "header", priority: 5 })], {})
    assert.deepStrictEqual(result.header, [component])
  })

  test("returns empty arrays when no entries have layout", () => {
    const component = makeComponent("NoLayout")
    componentRegistry.register("no-layout", component, "test-source")
    const result = buildLayoutForEntries([makeEntry("no-layout")], {})
    assert.deepStrictEqual(result.header, [])
    assert.deepStrictEqual(result.left, [])
    assert.deepStrictEqual(result.right, [])
    assert.deepStrictEqual(result.beforeBody, [])
    assert.deepStrictEqual(result.afterBody, [])
    assert.deepStrictEqual(result.footer, [])
  })
})

describe("defaultPosition fallback", () => {
  test("uses manifest defaultPosition when no explicit layout", () => {
    const component = makeComponent("F")
    componentRegistry.register("f", component, "test-source", {
      name: "f",
      displayName: "F",
      description: "",
      version: "1",
      defaultPosition: "footer",
      defaultPriority: 50,
    })
    const result = buildLayoutForEntries([makeEntry("f")], {})
    assert.deepStrictEqual(result.footer, [component])
  })

  test("explicit layout takes precedence over defaultPosition", () => {
    const component = makeComponent("P")
    componentRegistry.register("p", component, "test-source", {
      name: "p",
      displayName: "P",
      description: "",
      version: "1",
      defaultPosition: "right",
    })
    const result = buildLayoutForEntries([makeEntry("p", { position: "left", priority: 10 })], {})
    assert.deepStrictEqual(result.left, [component])
    assert.deepStrictEqual(result.right, [])
  })

  test("silently skips invalid defaultPosition", () => {
    const component = makeComponent("Bad")
    componentRegistry.register("bad", component, "test-source", {
      name: "bad",
      displayName: "Bad",
      description: "",
      version: "1",
      defaultPosition: "body",
    })
    const result = buildLayoutForEntries([makeEntry("bad")], {})
    assert.deepStrictEqual(result.header, [])
    assert.deepStrictEqual(result.left, [])
    assert.deepStrictEqual(result.right, [])
    assert.deepStrictEqual(result.beforeBody, [])
    assert.deepStrictEqual(result.afterBody, [])
    assert.deepStrictEqual(result.footer, [])
  })
})

describe("priority sorting", () => {
  test("sorts components within a position by priority", () => {
    const compA = makeComponent("A")
    const compB = makeComponent("B")
    const compC = makeComponent("C")
    componentRegistry.register("a", compA, "test-source")
    componentRegistry.register("b", compB, "test-source")
    componentRegistry.register("c", compC, "test-source")
    const result = buildLayoutForEntries(
      [
        makeEntry("a", { position: "left", priority: 30 }),
        makeEntry("b", { position: "left", priority: 10 }),
        makeEntry("c", { position: "left", priority: 20 }),
      ],
      {},
    )
    const names = result.left?.map((component) => component.displayName)
    assert.deepStrictEqual(names, ["B", "C", "A"])
  })

  test("defaults to priority 50 for defaultPosition without defaultPriority", () => {
    const explicit = makeComponent("Explicit")
    const ctor = makeConstructor("Default")
    const defaulted = ctor(undefined)
    componentRegistry.register("explicit", explicit, "test-source")
    componentRegistry.register("defaulted", defaulted, "test-source", {
      name: "defaulted",
      displayName: "Default",
      description: "",
      version: "1",
      defaultPosition: "left",
    })
    const result = buildLayoutForEntries(
      [makeEntry("explicit", { position: "left", priority: 40 }), makeEntry("defaulted")],
      {},
    )
    const names = result.left?.map((component) => component.displayName)
    assert.deepStrictEqual(names, ["Explicit", "Default"])
  })
})

describe("buildLayoutForEntries with display wrappers", () => {
  test("applies display wrapper for mobile-only", () => {
    const component = makeComponent("Wrapped")
    componentRegistry.register("wrapped-plugin", component, "test-source")
    const result = buildLayoutForEntries(
      [
        {
          ...makeEntry("wrapped-plugin", { position: "left", priority: 10 }),
          layout: { position: "left", priority: 10, display: "mobile-only" },
        },
      ],
      {},
    )
    assert.strictEqual(result.left?.length, 1)
    assert.notStrictEqual(result.left?.[0], component)
  })

  test("applies display wrapper for desktop-only", () => {
    const component = makeComponent("Wrapped")
    componentRegistry.register("wrapped-plugin", component, "test-source")
    const result = buildLayoutForEntries(
      [
        {
          ...makeEntry("wrapped-plugin", { position: "left", priority: 10 }),
          layout: { position: "left", priority: 10, display: "desktop-only" },
        },
      ],
      {},
    )
    assert.strictEqual(result.left?.length, 1)
    assert.notStrictEqual(result.left?.[0], component)
  })

  test("applies display wrapper for tablet", () => {
    const component = makeComponent("Wrapped")
    componentRegistry.register("wrapped-plugin", component, "test-source")
    const result = buildLayoutForEntries(
      [
        {
          ...makeEntry("wrapped-plugin", { position: "left", priority: 10 }),
          layout: { position: "left", priority: 10, display: "tablet" },
        },
      ],
      {},
    )
    assert.strictEqual(result.left?.length, 1)
    assert.notStrictEqual(result.left?.[0], component)
  })
})
