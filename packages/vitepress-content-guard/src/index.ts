import {
  createContentGuard,
  isContentGuardMode,
  type ContentGuardController,
  type ContentGuardMode,
  type CopyrightOptions,
} from "@kb/content-guard";
import "@kb/content-guard/style.css";
import type { EnhanceAppContext, Theme } from "vitepress";

export interface VitePressContentGuardOptions {
  readonly copyright: CopyrightOptions;
  readonly defaultMode?: ContentGuardMode;
  readonly target?: string;
  readonly frontmatterKey?: string;
  readonly allowSelector?: string;
  readonly contextMenuAllowSelector?: string;
  readonly printMessage?: string;
}

const DEFAULT_TARGET = ".vp-doc";
const DEFAULT_FRONTMATTER_KEY = "contentGuard";

export function withContentGuard(
  theme: Theme,
  options: VitePressContentGuardOptions,
): Theme {
  let controller: ContentGuardController | null = null;
  let animationFrame: number | null = null;
  let detachRouteHook: (() => void) | null = null;

  const destroy = (): void => {
    if (animationFrame !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    detachRouteHook?.();
    detachRouteHook = null;
    controller?.destroy();
    controller = null;
  };

  const runtimeMeta = import.meta as ImportMeta & {
    readonly env?: { readonly DEV?: boolean };
    readonly hot?: { dispose(callback: () => void): void };
  };
  runtimeMeta.hot?.dispose(destroy);

  return {
    ...theme,
    async enhanceApp(context) {
      await theme.enhanceApp?.(context);
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }

      destroy();
      controller = createController(context, options);
      controller.start();

      const sync = (): void => {
        if (!controller) return;
        controller.update({
          mode: resolveMode(context, options),
          source: {
            title: context.router.route.data.title,
            url: getCurrentUrl(),
          },
        });
        scheduleRefresh();
      };

      const scheduleRefresh = (): void => {
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
        }
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = null;
          controller?.refresh();
        });
      };

      const previousRouteHook = context.router.onAfterRouteChange;
      const routeHook: NonNullable<
        typeof context.router.onAfterRouteChange
      > = async (to) => {
        await previousRouteHook?.(to);
        sync();
      };

      context.router.onAfterRouteChange = routeHook;
      detachRouteHook = () => {
        if (context.router.onAfterRouteChange !== routeHook) return;
        if (previousRouteHook) {
          context.router.onAfterRouteChange = previousRouteHook;
        } else {
          delete context.router.onAfterRouteChange;
        }
      };

      sync();
    },
  };
}

function createController(
  context: EnhanceAppContext,
  options: VitePressContentGuardOptions,
): ContentGuardController {
  const optionalSelectors = {
    ...(options.allowSelector === undefined
      ? {}
      : { allowSelector: options.allowSelector }),
    ...(options.contextMenuAllowSelector === undefined
      ? {}
      : { contextMenuAllowSelector: options.contextMenuAllowSelector }),
    ...(options.printMessage === undefined
      ? {}
      : { printMessage: options.printMessage }),
  };

  return createContentGuard({
    target: options.target ?? DEFAULT_TARGET,
    mode: resolveMode(context, options),
    copyright: options.copyright,
    source: {
      title: context.router.route.data.title,
      url: getCurrentUrl(),
    },
    document,
    ...optionalSelectors,
  });
}

function resolveMode(
  context: EnhanceAppContext,
  options: VitePressContentGuardOptions,
): ContentGuardMode {
  const fallback = options.defaultMode ?? "copyright";
  const key = options.frontmatterKey ?? DEFAULT_FRONTMATTER_KEY;
  const value: unknown = context.router.route.data.frontmatter[key];

  if (value === undefined) return fallback;
  if (isContentGuardMode(value)) return value;

  const runtimeMeta = import.meta as ImportMeta & {
    readonly env?: { readonly DEV?: boolean };
  };
  if (runtimeMeta.env?.DEV) {
    console.warn(
      `[vitepress-content-guard] Invalid frontmatter value for ${key}:`,
      value,
      `Falling back to "${fallback}".`,
    );
  }
  return fallback;
}

function getCurrentUrl(): string {
  const url = new URL(window.location.href);
  url.hash = "";
  return url.href;
}
