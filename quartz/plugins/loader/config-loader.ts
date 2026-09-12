import fs from "fs"
import path from "path"
import YAML from "yaml"
import { styleText } from "util"
import { fileURLToPath } from "node:url"
import { QuartzConfig, GlobalConfiguration, FullPageLayout } from "../../cfg"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../components/types"
import {
  PluginTypes,
  QuartzTransformerPluginInstance,
  QuartzFilterPluginInstance,
  QuartzEmitterPluginInstance,
  PageTypePluginEntry,
} from "../types"
import {
  PluginManifest,
  PluginJsonEntry,
  PluginSource,
  QuartzPluginsJson,
  LayoutConfig,
  PluginLayoutDeclaration,
} from "./types"
import { parsePluginSource, getPluginEntryPoint, toFileUrl, isLocalSource } from "./gitLoader"
import { loadComponentsFromPackage } from "./componentLoader"
import { loadFramesFromPackage } from "./frameLoader"
import { componentRegistry } from "../../components/registry"
import { getCondition } from "./conditions"
import Flex from "../../components/Flex"
import MobileOnly from "../../components/MobileOnly"
import DesktopOnly from "../../components/DesktopOnly"
import ConditionalRender from "../../components/ConditionalRender"

const CONFIG_YAML_PATH = path.join(process.cwd(), "quartz.config.yaml")
const DEFAULT_CONFIG_YAML_PATH = path.join(process.cwd(), "quartz.config.default.yaml")
const LEGACY_PLUGINS_JSON_PATH = path.join(process.cwd(), "quartz.plugins.json")
const LEGACY_DEFAULT_PLUGINS_JSON_PATH = path.join(process.cwd(), "quartz.plugins.default.json")

function resolveConfigPath(): string {
  if (fs.existsSync(CONFIG_YAML_PATH)) return CONFIG_YAML_PATH
  if (fs.existsSync(LEGACY_PLUGINS_JSON_PATH)) return LEGACY_PLUGINS_JSON_PATH
  if (fs.existsSync(DEFAULT_CONFIG_YAML_PATH)) return DEFAULT_CONFIG_YAML_PATH
  if (fs.existsSync(LEGACY_DEFAULT_PLUGINS_JSON_PATH)) return LEGACY_DEFAULT_PLUGINS_JSON_PATH
  return CONFIG_YAML_PATH
}

function readPluginsJson(): QuartzPluginsJson | null {
  const configPath = resolveConfigPath()
  if (!fs.existsSync(configPath)) return null
  const raw = fs.readFileSync(configPath, "utf-8")
  if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) return YAML.parse(raw) as QuartzPluginsJson
  return JSON.parse(raw) as QuartzPluginsJson
}

function extractPluginName(source: PluginSource): string {
  if (typeof source === "object" && source !== null) {
    if (source.name) return source.name
    return extractPluginName(source.repo)
  }
  if (isLocalSource(source)) return path.basename(source.replace(/[\\/]+$/, ""))
  if (source.startsWith("github:")) {
    const withoutPrefix = source.replace("github:", "")
    const [repoPath] = withoutPrefix.split("#")
    const parts = repoPath.split("/")
    return parts[parts.length - 1]
  }
  if (source.startsWith("git+") || source.startsWith("https://")) {
    const url = source.replace("git+", "")
    const match = url.match(/\/([^/]+?)(?:\.git)?(?:#|$)/)
    return match?.[1] ?? source
  }
  return source
}

function formatSourceDisplay(source: PluginSource): string {
  if (typeof source === "string") return source
  const parts = [source.repo]
  if (source.subdir) parts.push(`(subdir: ${source.subdir})`)
  if (source.ref) parts.push(`(ref: ${source.ref})`)
  return parts.join(" ")
}

function sourceKey(source: PluginSource): string {
  return typeof source === "string" ? source : JSON.stringify(source)
}

interface DependencyValidationResult {
  errors: string[]
  warnings: string[]
}

function validateDependencies(
  entries: PluginJsonEntry[],
  manifests: Map<string, PluginManifest | undefined>,
): DependencyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const sourceToEntry = new Map<string, PluginJsonEntry>()
  for (const entry of entries) sourceToEntry.set(sourceKey(entry.source), entry)
  for (const entry of entries) {
    if (!entry.enabled) continue
    const manifest = manifests.get(sourceKey(entry.source))
    if (!manifest?.dependencies?.length) continue
    const pluginName = manifest.displayName || extractPluginName(entry.source)
    const pluginOrder = entry.order ?? manifest.defaultOrder ?? 50
    for (const dep of manifest.dependencies) {
      const depEntry = sourceToEntry.get(dep)
      const depName = extractPluginName(dep)
      if (!depEntry) {
        errors.push(`Plugin "${pluginName}" requires "${depName}". Run: npx quartz plugin add ${dep}`)
        continue
      }
      if (!depEntry.enabled) {
        warnings.push(`Plugin "${pluginName}" depends on "${depName}" which is disabled. "${pluginName}" may not function correctly.`)
      }
      const depManifest = manifests.get(dep)
      const depOrder = depEntry.order ?? depManifest?.defaultOrder ?? 50
      if (pluginOrder < depOrder) {
        errors.push(
          `Plugin "${pluginName}" (order: ${pluginOrder}) depends on "${depName}" (order: ${depOrder}), but "${pluginName}" is configured to run first. Either increase "${pluginName}"'s order above ${depOrder} or decrease "${depName}"'s order below ${pluginOrder}.`,
        )
      }
    }
  }
  const graph = new Map<string, string[]>()
  for (const entry of entries) {
    const manifest = manifests.get(sourceKey(entry.source))
    if (manifest?.dependencies?.length) graph.set(sourceKey(entry.source), manifest.dependencies)
  }
  const visited = new Set<string>()
  const inStack = new Set<string>()
  function detectCycle(node: string, pathSoFar: string[]): string[] | null {
    if (inStack.has(node)) {
      const cycleStart = pathSoFar.indexOf(node)
      return pathSoFar.slice(cycleStart).concat(node)
    }
    if (visited.has(node)) return null
    visited.add(node)
    inStack.add(node)
    for (const dep of graph.get(node) ?? []) {
      const cycle = detectCycle(dep, [...pathSoFar, node])
      if (cycle) return cycle
    }
    inStack.delete(node)
    return null
  }
  for (const node of graph.keys()) {
    const cycle = detectCycle(node, [])
    if (cycle) {
      errors.push(`Circular dependency detected: ${cycle.map(extractPluginName).join(" → ")}`)
      break
    }
  }
  return { errors, warnings }
}

async function resolvePluginManifest(source: PluginSource): Promise<PluginManifest | null> {
  try {
    const gitSpec = parsePluginSource(source)
    const entryPoint = getPluginEntryPoint(gitSpec.name)
    const module = await import(toFileUrl(entryPoint))
    return module.manifest ?? null
  } catch {
    return null
  }
}

async function readManifestFromPackageJson(source: PluginSource): Promise<PluginManifest | null> {
  try {
    const gitSpec = parsePluginSource(source)
    let pkgPath: string
    if (gitSpec.npmPackage) {
      pkgPath = fileURLToPath(import.meta.resolve(`${gitSpec.name}/package.json`))
    } else {
      const pluginDir = path.join(process.cwd(), ".quartz", "plugins", gitSpec.name)
      pkgPath = path.join(pluginDir, "package.json")
    }
    if (!fs.existsSync(pkgPath)) return null
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
    if (!pkg.quartz) return null
    const q = pkg.quartz
    return {
      name: q.name ?? gitSpec.name,
      displayName: q.displayName ?? q.name ?? gitSpec.name,
      description: q.description ?? pkg.description ?? "No description",
      version: q.version ?? pkg.version ?? "1.0.0",
      author: q.author ?? pkg.author,
      homepage: q.homepage ?? pkg.homepage,
      category: q.category,
      quartzVersion: q.quartzVersion,
      dependencies: q.dependencies,
      defaultOrder: q.defaultOrder,
      defaultEnabled: q.defaultEnabled,
      defaultOptions: q.defaultOptions,
      configSchema: q.configSchema,
      components: q.components,
      frames: q.frames,
    }
  } catch {
    return null
  }
}

async function getManifest(source: PluginSource): Promise<PluginManifest | undefined> {
  return (await readManifestFromPackageJson(source)) ?? (await resolvePluginManifest(source)) ?? undefined
}

export async function loadQuartzConfig(configOverrides?: Partial<GlobalConfiguration>): Promise<QuartzConfig> {
  const json = readPluginsJson()
  if (!json) {
    const oldConfig = await import("../../../quartz")
    return oldConfig.default
  }
  const configuration = {
    ...(json.configuration as unknown as GlobalConfiguration),
    ...configOverrides,
  }
  const entries = json.plugins ?? []
  const enabledEntries = entries.filter((e) => e.enabled)
  const manifests = new Map<string, PluginManifest | undefined>()
  for (const entry of enabledEntries) manifests.set(sourceKey(entry.source), await getManifest(entry.source))
  const dependencyValidation = validateDependencies(entries, manifests)
  if (dependencyValidation.errors.length) throw new Error(dependencyValidation.errors.join("\n"))
  if (dependencyValidation.warnings.length) {
    dependencyValidation.warnings.forEach((warning) => console.warn(styleText("yellow", "⚠") + " " + warning))
  }

  const transformers: { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[] = []
  const filters: { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[] = []
  const emitters: { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[] = []
  const pageTypes: { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[] = []

  for (const entry of enabledEntries) {
    const manifest = manifests.get(sourceKey(entry.source))
    const category = manifest?.category
    const processingCategories = ["transformer", "filter", "emitter", "pageType"] as const
    const categoryMap: Record<string, { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[]> = {
      transformer: transformers,
      filter: filters,
      emitter: emitters,
      pageType: pageTypes,
    }
    const categories = Array.isArray(category) ? category : category ? [category] : []
    const matchedProcessing = categories.filter((c) => (processingCategories as readonly string[]).includes(c))
    if (matchedProcessing.length > 0) {
      for (const cat of matchedProcessing) categoryMap[cat].push({ entry, manifest })
      continue
    }

    const gitSpec = parsePluginSource(entry.source)
    const isComponentOnly = categories.length > 0 && categories.every((c) => c === "component")
    if (isComponentOnly) {
      const entryPoint = getPluginEntryPoint(gitSpec.name)
      try {
        const module = await import(toFileUrl(entryPoint))
        if (typeof module.init === "function") {
          const initOverrides = componentRegistry.getOptionOverrides(gitSpec.name)
          const options = { ...manifest?.defaultOptions, ...entry.options, ...initOverrides }
          await module.init(Object.keys(options).length > 0 ? options : undefined)
        }
      } catch {}
      if (manifest?.components && Object.keys(manifest.components).length > 0) await loadComponentsFromPackage(gitSpec.name, manifest)
      if (manifest?.frames && Object.keys(manifest.frames).length > 0) await loadFramesFromPackage(gitSpec.name, manifest)
      continue
    }

    const entryPoint = getPluginEntryPoint(gitSpec.name)
    try {
      const module = await import(toFileUrl(entryPoint))
      const detected = detectCategoryFromModule(module)
      if (detected) categoryMap[detected].push({ entry, manifest })
      else if (manifest?.components && Object.keys(manifest.components).length > 0) {
        await loadComponentsFromPackage(gitSpec.name, manifest)
        if (manifest?.frames && Object.keys(manifest.frames).length > 0) await loadFramesFromPackage(gitSpec.name, manifest)
      } else {
        console.warn(styleText("yellow", "⚠") + ` Could not determine category for plugin "${extractPluginName(entry.source)}". Skipping.`)
      }
    } catch {
      const hasComponents = manifest?.components && Object.keys(manifest.components).length > 0
      const hasFrames = manifest?.frames && Object.keys(manifest.frames).length > 0
      if (hasComponents) await loadComponentsFromPackage(gitSpec.name, manifest)
      if (hasFrames) await loadFramesFromPackage(gitSpec.name, manifest)
      if (!hasComponents && !hasFrames) {
        console.warn(styleText("yellow", "⚠") + ` Could not load plugin "${extractPluginName(entry.source)}" to detect category. Skipping.`)
      }
    }
  }

  const sortByOrder = (
    a: { entry: PluginJsonEntry; manifest: PluginManifest | undefined },
    b: { entry: PluginJsonEntry; manifest: PluginManifest | undefined },
  ) => (a.entry.order ?? a.manifest?.defaultOrder ?? 50) - (b.entry.order ?? b.manifest?.defaultOrder ?? 50)

  transformers.sort(sortByOrder)
  filters.sort(sortByOrder)
  emitters.sort(sortByOrder)
  pageTypes.sort(sortByOrder)

  const instantiate = async <T>(
    items: { entry: PluginJsonEntry; manifest: PluginManifest | undefined }[],
    expectedCategory: ProcessingCategory,
  ): Promise<T[]> => {
    const instances: T[] = []
    for (const { entry, manifest } of items) {
      try {
        const spec = parsePluginSource(entry.source)
        let module
        if (spec.npmPackage) module = await import(spec.name)
        else module = await import(toFileUrl(getPluginEntryPoint(spec.name)))
        if (manifest?.components && Object.keys(manifest.components).length > 0) await loadComponentsFromPackage(spec.name, manifest)
        if (manifest?.frames && Object.keys(manifest.frames).length > 0) await loadFramesFromPackage(spec.name, manifest)
        const factory = findFactory(module, expectedCategory)
        if (!factory) {
          console.warn(styleText("yellow", "⚠") + ` Plugin "${extractPluginName(entry.source)}" has no factory function for category "${expectedCategory}".`)
          continue
        }
        const pluginOverrides = componentRegistry.getOptionOverrides(spec.name)
        const options = { ...manifest?.defaultOptions, ...entry.options, ...pluginOverrides }
        const instance = factory(Object.keys(options).length > 0 ? options : undefined)
        if (!instance || typeof instance !== "object") continue
        if (!validateCategory(instance, expectedCategory)) continue
        instances.push(instance as T)
      } catch (err) {
        console.error(styleText("red", "✗") + ` Failed to instantiate plugin "${extractPluginName(entry.source)}": ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    return instances
  }

  const builtinPlugins = await import("../index")
  const builtinTransformers: QuartzTransformerPluginInstance[] = []
  const builtinEmitters: QuartzEmitterPluginInstance[] = [builtinPlugins.ComponentResources(), builtinPlugins.Assets(), builtinPlugins.Static()]
  const builtinPageTypes: PageTypePluginEntry[] = [builtinPlugins.PageTypes.NotFoundPageType()]
  const plugins: PluginTypes = {
    transformers: [...builtinTransformers, ...(await instantiate<QuartzTransformerPluginInstance>(transformers, "transformer"))],
    filters: await instantiate<QuartzFilterPluginInstance>(filters, "filter"),
    emitters: [...builtinEmitters, ...(await instantiate<QuartzEmitterPluginInstance>(emitters, "emitter"))],
    pageTypes: [...(await instantiate<PageTypePluginEntry>(pageTypes, "pageType")), ...builtinPageTypes],
  }
  const layout = await loadQuartzLayout()
  plugins.emitters.push(builtinPlugins.PageTypes.PageTypeDispatcher({ defaults: layout.defaults, byPageType: layout.byPageType }))
  return { configuration, plugins }
}

 type ProcessingCategory = "transformer" | "filter" | "emitter" | "pageType"

function validateCategory(instance: Record<string, unknown>, expected: ProcessingCategory): boolean {
  switch (expected) {
    case "pageType": return "match" in instance && "body" in instance && "layout" in instance
    case "emitter": return "emit" in instance
    case "filter": return "shouldPublish" in instance
    case "transformer": return "textTransform" in instance || "markdownPlugins" in instance || "htmlPlugins" in instance
  }
}

function findFactory(module: Record<string, unknown>, expectedCategory?: ProcessingCategory): Function | null {
  if (typeof module.default === "function") return module.default as Function
  if (typeof module.plugin === "function") return module.plugin as Function
  const exportedFunctions = Object.entries(module).filter(([key, value]) => typeof value === "function" && !key.startsWith("__"))
  if (exportedFunctions.length === 1) return exportedFunctions[0][1] as Function
  if (exportedFunctions.length > 1 && expectedCategory) {
    for (const [, fn] of exportedFunctions) {
      try {
        const instance = (fn as Function)()
        if (instance && typeof instance === "object" && validateCategory(instance, expectedCategory)) return fn as Function
      } catch {}
    }
  }
  return null
}

function detectCategoryFromModule(module: unknown): ProcessingCategory | null {
  if (!module || typeof module !== "object") return null
  const mod = module as Record<string, unknown>
  const factory = findFactory(mod)
  if (factory && "quartzCategory" in factory) {
    const cat = (factory as Record<string, unknown>).quartzCategory
    if (cat === "transformer" || cat === "filter" || cat === "emitter" || cat === "pageType") return cat
  }
  if (typeof factory === "function") {
    try {
      const instance = factory()
      if (instance && typeof instance === "object") {
        if ("match" in instance && "body" in instance && "layout" in instance) return "pageType"
        if ("emit" in instance) return "emitter"
        if ("shouldPublish" in instance) return "filter"
        if ("textTransform" in instance || "markdownPlugins" in instance || "htmlPlugins" in instance) return "transformer"
      }
    } catch {}
  }
  return null
}

function applyDisplayWrapper(component: QuartzComponent, display: "mobile-only" | "desktop-only" | "tablet"): QuartzComponent {
  if (display === "mobile-only") return MobileOnly(component) as QuartzComponent
  if (display === "desktop-only") return DesktopOnly(component) as QuartzComponent
  const tabletOnly = (props: QuartzComponentProps) =>
    `<div class="tablet-only">${String(props.children ?? "")}</div>`
  return ((props: QuartzComponentProps) => tabletOnly(props)) as unknown as QuartzComponent
}

function applyConditionWrapper(component: QuartzComponent, conditionName: string): QuartzComponent {
  const predicate = getCondition(conditionName)
  if (!predicate) {
    console.warn(styleText("yellow", "⚠") + ` Unknown condition "${conditionName}". Component will always render.`)
    return component
  }
  return ConditionalRender({ component, condition: predicate }) as QuartzComponent
}

export async function loadQuartzLayout(layoutOverrides?: {
  defaults?: Partial<FullPageLayout>
  byPageType?: Record<string, Partial<FullPageLayout>>
}): Promise<{
  defaults: Partial<FullPageLayout>
  byPageType: Record<string, Partial<FullPageLayout>>
}> {
  const json = readPluginsJson()
  if (!json) {
    const oldLayout = await import("../../../quartz")
    return oldLayout.layout
  }
  const enabledWithLayout = json.plugins.filter((e) => e.enabled)
  const layoutConfig = json.layout ?? {}
  const defaultLayout = buildLayoutForEntries(enabledWithLayout, layoutConfig)
  const byPageType: Record<string, Partial<FullPageLayout>> = {}
  if (layoutConfig.byPageType) {
    for (const [pageType, override] of Object.entries(layoutConfig.byPageType)) {
      let filteredEntries = enabledWithLayout
      if (override.exclude?.length) {
        filteredEntries = filteredEntries.filter((e) => !override.exclude!.includes(extractPluginName(e.source)))
      }
      const ptLayout = buildLayoutForEntries(filteredEntries, layoutConfig)
      if (override.positions) {
        for (const [pos, components] of Object.entries(override.positions)) {
          if (Array.isArray(components) && components.length === 0) {
            const key = pos as keyof Pick<FullPageLayout, "header" | "left" | "right" | "beforeBody" | "afterBody" | "footer">
            if (key in ptLayout) {
              ;(ptLayout as Record<string, unknown>)[key] = []
            }
          }
        }
      }
      if (override.template) ptLayout.frame = override.template
      byPageType[pageType] = ptLayout
    }
  }
  const HeadModule = await import("../../components/Head")
  const head = HeadModule.default()
  defaultLayout.head = head
  defaultLayout.header = defaultLayout.header ?? []
  defaultLayout.footer = defaultLayout.footer ?? []
  for (const pageType of Object.keys(byPageType)) {
    const pt = byPageType[pageType]
    if (!pt.head) pt.head = head
    if (!pt.header) pt.header = defaultLayout.header
    if (!pt.footer) pt.footer = defaultLayout.footer
  }
  const mergedDefaults = { ...defaultLayout, ...layoutOverrides?.defaults }
  const mergedByPageType = { ...byPageType }
  if (layoutOverrides?.byPageType) {
    for (const [pageType, overrideLayout] of Object.entries(layoutOverrides.byPageType)) {
      mergedByPageType[pageType] = { ...mergedByPageType[pageType], ...overrideLayout }
    }
  }
  return { defaults: mergedDefaults, byPageType: mergedByPageType }
}

export function buildLayoutForEntries(entries: PluginJsonEntry[], layoutConfig: LayoutConfig): Partial<FullPageLayout> {
  const positions: Record<string, { component: QuartzComponent; priority: number; group?: string; groupOptions?: PluginLayoutDeclaration["groupOptions"] }[]> = {
    header: [], left: [], right: [], beforeBody: [], afterBody: [], footer: [],
  }
  for (const entry of entries) {
    if (!entry.layout) continue
    const layout = entry.layout
    const name = extractPluginName(entry.source)
    const registered = componentRegistry.get(name) ?? componentRegistry.get(`${formatSourceDisplay(entry.source)}/${name}`)
    const pascalName = name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")
    const reg = registered ?? componentRegistry.get(pascalName)
    if (!reg) continue
    let component: QuartzComponent
    if (typeof reg.component === "function" && !("displayName" in reg.component)) {
      const tsOverrides = componentRegistry.getOptionOverrides(name)
      const opts = { ...entry.options, ...tsOverrides }
      const optsArg = Object.keys(opts).length > 0 ? opts : undefined
      component = componentRegistry.instantiate(reg.component as QuartzComponentConstructor, optsArg)
    } else component = reg.component as QuartzComponent
    if (layout.display && layout.display !== "all") component = applyDisplayWrapper(component, layout.display)
    if (layout.condition) component = applyConditionWrapper(component, layout.condition)
    const posArray = positions[layout.position]
    if (posArray) posArray.push({ component, priority: layout.priority, group: layout.group, groupOptions: layout.groupOptions })
  }
  for (const entry of entries) {
    if (!entry.enabled || entry.layout) continue
    const name = extractPluginName(entry.source)
    const registered = componentRegistry.get(name) ?? componentRegistry.get(`${formatSourceDisplay(entry.source)}/${name}`)
    const pascalName = name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")
    const reg = registered ?? componentRegistry.get(pascalName)
    if (!reg) continue
    const layoutDefaults = reg.manifest
    const defaultPosition = layoutDefaults?.defaultPosition
    if (!defaultPosition) continue
    const posArray = positions[defaultPosition]
    if (!posArray) continue
    let component: QuartzComponent
    if (typeof reg.component === "function" && !("displayName" in reg.component)) {
      const tsOverrides = componentRegistry.getOptionOverrides(name)
      const opts = { ...entry.options, ...tsOverrides }
      const optsArg = Object.keys(opts).length > 0 ? opts : undefined
      component = componentRegistry.instantiate(reg.component as QuartzComponentConstructor, optsArg)
    } else component = reg.component as QuartzComponent
    posArray.push({ component, priority: layoutDefaults?.defaultPriority ?? 50 })
  }
  const buildPosition = (items: typeof positions.header): QuartzComponent[] => {
    const sorted = [...items].sort((a, b) => a.priority - b.priority)
    const groups = new Map<string, typeof sorted>()
    for (const item of sorted) {
      if (item.group) {
        const existing = groups.get(item.group)
        if (existing) existing.push(item)
        else groups.set(item.group, [item])
      }
    }
    const entries: { priority: number; component: QuartzComponent }[] = []
    const processedGroups = new Set<string>()
    for (const item of sorted) {
      if (item.group) {
        if (processedGroups.has(item.group)) continue
        processedGroups.add(item.group)
        const members = groups.get(item.group)
        if (!members) continue
        const groupConfig = layoutConfig.groups?.[item.group] ?? {}
        const flexComponents = members.map((m) => ({ Component: m.component, grow: m.groupOptions?.grow, shrink: m.groupOptions?.shrink, basis: m.groupOptions?.basis, order: m.groupOptions?.order, align: m.groupOptions?.align, justify: m.groupOptions?.justify }))
        entries.push({ priority: item.priority, component: Flex({ components: flexComponents, direction: groupConfig.direction ?? "row", wrap: groupConfig.wrap, gap: groupConfig.gap ?? "1rem" }) as QuartzComponent })
      } else entries.push({ priority: item.priority, component: item.component })
    }
    entries.sort((a, b) => a.priority - b.priority)
    return entries.map((e) => e.component)
  }
  return {
    header: buildPosition(positions.header),
    left: buildPosition(positions.left),
    right: buildPosition(positions.right),
    beforeBody: buildPosition(positions.beforeBody),
    afterBody: buildPosition(positions.afterBody),
    footer: buildPosition(positions.footer),
  }
}
