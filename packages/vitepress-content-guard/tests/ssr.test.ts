// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createContentGuard } from "@kb/content-guard";
import type { EnhanceAppContext, Theme } from "vitepress";
import { withContentGuard } from "../src/index";

describe("server-side rendering", () => {
  it("keeps the core controller inert when no DOM exists", () => {
    const controller = createContentGuard({
      target: ".article",
      copyright: { owner: "zherunliu" },
    });
    expect(() => controller.start()).not.toThrow();
    expect(controller.started).toBe(false);
    controller.destroy();
  });

  it("imports and enhances without accessing browser globals", async () => {
    const originalEnhance = vi.fn();
    const theme: Theme = withContentGuard(
      { enhanceApp: originalEnhance },
      { copyright: { owner: "zherunliu" } },
    );
    const context = {
      app: {},
      router: {},
      siteData: {},
    } as EnhanceAppContext;

    await expect(theme.enhanceApp?.(context)).resolves.toBeUndefined();
    expect(originalEnhance).toHaveBeenCalledOnce();
  });
});
