import {
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
} from "../types"
import { BuildCtx } from "../../util/ctx"

export type PluginCategory = "transformer" | "filter" | "emitter" | "pageType" | "component"

export type LayoutPosition = "left" | "right" | "beforeBody" | "afterBody" | "header" | "footer"

export type LayoutDisplay = "all" | "mobile-only" | "desktop-only" | "tablet"

/** Component manifest metadata */
export interface ComponentManifest {
  name: string
  displayName: string
  description: string
  version: string
  quartzVersion?: string
  author?: string
  homepage?: string
}

/** Layout defaults for a component declared in a plugin manifest. */
export interface ComponentLayoutDefaults {
  displayName: string
  description?: string
  defaultPosition?: LayoutPosition
  defaultPriority?: number
}

/** Plugin manifest metadata for discovery and documentation. */
export interface PluginManifest {
  name: string
  displayName: string
  description: string
  version: string
  author?: string
  homepage?: string
  keywords?: string[]
  category?: PluginCategory | PluginCategory[]
  quartzVersion?: string
  dependencies?: string[]
  defaultOrder?: number
  defaultEnabled?: boolean
  defaultOptions?: Record<string, unknown>
  configSchema?: object
  components?: Record<string, ComponentManifest & ComponentLayoutDefaults>
  frames?: Record<string, { exportName: string }>
  requiresInstall?: boolean
}

export interface LoadedPlugin {
  plugin: QuartzTransformerPlugin | QuartzFilterPlugin | QuartzEmitterPlugin | QuartzPageTypePlugin
  manifest: PluginManifest
  type: PluginCategory
  source: string
}

export interface PluginResolution {
  plugins: LoadedPlugin[]
  errors: PluginResolutionError[]
}

export interface PluginResolutionError {
  plugin: string
  message: string
  type: "not-found" | "invalid-manifest" | "version-mismatch" | "import-error"
}

export interface PluginResolutionOptions {
  quartzVersion: string
  ctx: BuildCtx
  verbose?: boolean
}

export type PluginSpecifier =
  | string
  | { name: string; options?: unknown }
  | { plugin: LoadedPlugin["plugin"]; manifest?: Partial<PluginManifest> }

export interface PluginLayoutDeclaration {
  position: LayoutPosition
  priority: number
  display?: LayoutDisplay
  condition?: string
  group?: string
  mobileHeader?: boolean
  groupOptions?: {
    grow?: boolean
    shrink?: boolean
    basis?: string
    order?: number
    align?: "start" | "end" | "center" | "stretch"
    justify?: "start" | "end" | "center" | "between" | "around"
  }
}

export interface PluginSourceObject {
  repo: string
  subdir?: string
  ref?: string
  name?: string
}

export type PluginSource = string | PluginSourceObject

export interface PluginJsonEntry {
  source: PluginSource
  enabled: boolean
  options?: Record<string, unknown>
  order?: number
  layout?: PluginLayoutDeclaration
}

export interface FlexGroupConfig {
  priority?: number
  direction?: "row" | "row-reverse" | "column" | "column-reverse"
  wrap?: "nowrap" | "wrap" | "wrap-reverse"
  gap?: string
}

export interface PageTypeLayoutOverride {
  exclude?: string[]
  positions?: Partial<Record<LayoutPosition, PluginLayoutDeclaration[]>>
  template?: string
}

export interface LayoutConfig {
  groups?: Record<string, FlexGroupConfig>
  byPageType?: Record<string, PageTypeLayoutOverride>
}

export interface QuartzPluginsJson {
  $schema?: string
  configuration: Record<string, unknown>
  plugins: PluginJsonEntry[]
  layout?: LayoutConfig
}
