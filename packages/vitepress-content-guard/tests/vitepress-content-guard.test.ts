import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnhanceAppContext, Router, Theme } from "vitepress";
import { withContentGuard } from "../src/index";

function createContext(
  frontmatter: Record<string, unknown> = {},
): EnhanceAppContext {
  const router = {
    route: {
      path: "/article",
      hash: "",
      query: "",
      component: null,
      data: {
        title: "Article title",
        titleTemplate: undefined,
        description: "",
        frontmatter,
        headers: [],
        relativePath: "article.md",
        filePath: "article.md",
        lastUpdated: 0,
        params: {},
        isNotFound: false,
      },
    },
    go: vi.fn(),
  } as unknown as Router;

  return {
    app: { config: {} } as EnhanceAppContext["app"],
    router,
    siteData: { value: {} } as EnhanceAppContext["siteData"],
  };
}

async function enhance(
  theme: Theme,
  context: EnhanceAppContext,
): Promise<void> {
  await theme.enhanceApp?.(context);
}

describe("withContentGuard", () => {
  beforeEach(() => {
    document.body.innerHTML = '<article class="vp-doc">Content</article>';
    window.history.replaceState({}, "", "/kb/article#section");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses copyright as the default and removes URL hashes", async () => {
    const context = createContext();
    const theme = withContentGuard(
      {},
      {
        copyright: { owner: "zherunliu", year: 2026 },
      },
    );
    await enhance(theme, context);

    const root = document.querySelector<HTMLElement>(".vp-doc");
    expect(root?.dataset.contentGuardMode).toBe("copyright");
    expect(root?.dataset.contentGuardTitle).toBe("Article title");
    expect(root?.dataset.contentGuardSource).toBe(
      "http://localhost:3000/kb/article",
    );
  });

  it("resolves frontmatter overrides after route changes", async () => {
    const context = createContext({ contentGuard: "strict" });
    const theme = withContentGuard(
      {},
      {
        copyright: { owner: "zherunliu" },
        defaultMode: "off",
      },
    );
    await enhance(theme, context);
    expect(
      document.querySelector<HTMLElement>(".vp-doc")?.dataset.contentGuardMode,
    ).toBe("strict");

    context.router.route.data.frontmatter.contentGuard = "off";
    context.router.route.data.title = "Second article";
    window.history.replaceState({}, "", "/kb/second#heading");
    await context.router.onAfterRouteChange?.("/kb/second");

    const root = document.querySelector<HTMLElement>(".vp-doc");
    expect(root?.dataset.contentGuardMode).toBe("off");
    expect(root?.dataset.contentGuardTitle).toBe("Second article");
    expect(root?.dataset.contentGuardSource).toBe(
      "http://localhost:3000/kb/second",
    );
  });

  it("preserves theme enhancement and existing route hooks", async () => {
    const calls: string[] = [];
    const context = createContext();
    const baseTheme: Theme = {
      enhanceApp({ router }) {
        calls.push("enhance");
        router.onAfterRouteChange = () => {
          calls.push("route");
        };
      },
    };
    const theme = withContentGuard(baseTheme, {
      copyright: { owner: "zherunliu" },
    });

    await enhance(theme, context);
    await context.router.onAfterRouteChange?.("/next");
    expect(calls).toEqual(["enhance", "route"]);
  });

  it("falls back and warns for invalid frontmatter in development", async () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const context = createContext({ contentGuard: "maximum" });
    const theme = withContentGuard(
      {},
      {
        defaultMode: "strict",
        copyright: { owner: "zherunliu" },
      },
    );

    await enhance(theme, context);
    expect(
      document.querySelector<HTMLElement>(".vp-doc")?.dataset.contentGuardMode,
    ).toBe("strict");
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("Invalid frontmatter value"),
      "maximum",
      expect.stringContaining('Falling back to "strict"'),
    );
  });

  it("supports a custom target, frontmatter key, selectors and print message", async () => {
    document.body.innerHTML = '<main class="custom">Content</main>';
    const context = createContext({ protection: "copyright" });
    const theme = withContentGuard(
      {},
      {
        target: ".custom",
        frontmatterKey: "protection",
        allowSelector: "kbd",
        contextMenuAllowSelector: "a",
        printMessage: "Protected document.",
        copyright: { owner: "zherunliu", statement: "Custom rights." },
      },
    );

    await enhance(theme, context);
    const root = document.querySelector<HTMLElement>(".custom");
    expect(root?.dataset.contentGuardMode).toBe("copyright");
    expect(root?.dataset.contentGuardPrintMessage).toBe("Protected document.");
    expect(root?.dataset.contentGuardCopyright).toBe("Custom rights.");
  });
});
