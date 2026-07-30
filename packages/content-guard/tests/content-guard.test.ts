import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createContentGuard,
  isContentGuardMode,
  type ContentGuardController,
  type ContentGuardMode,
} from "../src/index";

const styles = readFileSync(
  resolve(process.cwd(), "packages/content-guard/style.css"),
  "utf8",
);

class ClipboardDataStub {
  readonly values = new Map<string, string>();

  setData(format: string, value: string): void {
    this.values.set(format, value);
  }

  getData(format: string): string {
    return this.values.get(format) ?? "";
  }
}

function dispatchCopy(
  target: Element,
  withClipboard = true,
): {
  readonly event: ClipboardEvent;
  readonly clipboard: ClipboardDataStub | null;
} {
  const clipboard = withClipboard ? new ClipboardDataStub() : null;
  const event = new Event("copy", {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", { value: clipboard });
  target.dispatchEvent(event);
  return { event, clipboard };
}

function selectRange(
  start: Node,
  startOffset: number,
  end: Node = start,
  endOffset = start.textContent?.length ?? 0,
): Selection {
  const range = document.createRange();
  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);
  const selection = document.getSelection();
  if (!selection) throw new Error("Selection API is unavailable");
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

function createController(
  mode: ContentGuardMode = "copyright",
  overrides: Partial<Parameters<typeof createContentGuard>[0]> = {},
): ContentGuardController {
  return createContentGuard({
    target: ".article",
    mode,
    copyright: { owner: "zherunliu", year: 2026 },
    source: {
      title: "Testing article",
      url: "https://example.com/article",
    },
    document,
    ...overrides,
  });
}

describe("createContentGuard", () => {
  const controllers: ContentGuardController[] = [];

  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <article class="article">
          <p id="first">Protected text</p>
          <pre><code id="code">const answer = 42;</code></pre>
          <a id="link" href="/next">Next page</a>
          <input id="input" value="editable">
          <span id="allowed" data-content-guard-allow>Allowed text</span>
          <p id="last">Final text</p>
        </article>
        <p id="outside">Outside text</p>
      </main>
    `;
    document.getSelection()?.removeAllRanges();
  });

  afterEach(() => {
    for (const controller of controllers) controller.destroy();
    controllers.length = 0;
    document.getSelection()?.removeAllRanges();
  });

  const start = (
    mode: ContentGuardMode = "copyright",
    overrides: Partial<Parameters<typeof createContentGuard>[0]> = {},
  ): ContentGuardController => {
    const controller = createController(mode, overrides);
    controllers.push(controller);
    controller.start();
    return controller;
  };

  it("recognizes only supported modes", () => {
    expect(isContentGuardMode("strict")).toBe(true);
    expect(isContentGuardMode("copyright")).toBe(true);
    expect(isContentGuardMode("off")).toBe(true);
    expect(isContentGuardMode("disabled")).toBe(false);
    expect(isContentGuardMode(null)).toBe(false);
  });

  it("requires a non-empty copyright owner", () => {
    expect(() =>
      createController("copyright", { copyright: { owner: "   " } }),
    ).toThrowError("copyright.owner must not be empty");
  });

  it("starts idempotently and decorates only the protected root", () => {
    const controller = start();
    controller.start();

    const root = document.querySelector<HTMLElement>(".article");
    const outside = document.querySelector<HTMLElement>("#outside");
    expect(controller.started).toBe(true);
    expect(controller.mode).toBe("copyright");
    expect(root?.dataset.contentGuardMode).toBe("copyright");
    expect(root?.dataset.contentGuardCopyright).toContain(
      "Copyright © 2026 zherunliu",
    );
    expect(root?.dataset.contentGuardTitle).toBe("Testing article");
    expect(outside?.dataset.contentGuardMode).toBeUndefined();
  });

  it("uses default mode, current document source and a functional target", () => {
    document.title = "Fallback title";
    window.history.replaceState({}, "", "/fallback#heading");
    const root = document.querySelector<HTMLElement>(".article");
    if (!root) throw new Error("Fixture is incomplete");

    const controller = createContentGuard({
      target: () => root,
      copyright: { owner: "zherunliu" },
    });
    controllers.push(controller);
    controller.start();

    expect(controller.mode).toBe("copyright");
    expect(root.dataset.contentGuardTitle).toBe("Fallback title");
    expect(root.dataset.contentGuardSource).toBe(
      "http://localhost:3000/fallback",
    );
    expect(root.dataset.contentGuardCopyright).toContain(
      `Copyright © ${new Date().getFullYear()} zherunliu`,
    );
  });

  it("derives the owner document from a static target element", () => {
    const root = document.querySelector<HTMLElement>(".article");
    if (!root) throw new Error("Fixture is incomplete");
    const controller = createContentGuard({
      target: root,
      mode: "strict",
      copyright: { owner: "zherunliu" },
    });
    controllers.push(controller);
    controller.start();
    expect(root.dataset.contentGuardMode).toBe("strict");
  });

  it("handles a temporarily missing SPA target", () => {
    const controller = createContentGuard({
      target: ".missing",
      mode: "strict",
      copyright: { owner: "zherunliu" },
      document,
    });
    controllers.push(controller);
    controller.refresh();
    controller.start();
    expect(controller.started).toBe(true);

    const eventWithoutRoot = new KeyboardEvent("keydown", {
      key: "p",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(eventWithoutRoot);
    expect(eventWithoutRoot.defaultPrevented).toBe(false);

    const root = document.createElement("article");
    root.className = "missing";
    document.body.append(root);
    controller.refresh();
    expect(root.dataset.contentGuardMode).toBe("strict");
  });

  it("rewrites plain text and HTML in copyright mode", () => {
    start();
    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0, text, 9);

    const { event, clipboard } = dispatchCopy(paragraph);
    expect(event.defaultPrevented).toBe(true);
    expect(clipboard?.getData("text/plain")).toBe(
      [
        "Protected",
        "",
        "Copyright © 2026 zherunliu. All rights reserved.",
        "Unauthorized reproduction or distribution of this content is prohibited without prior written permission.",
        "",
        "Title: Testing article",
        "Source: https://example.com/article",
      ].join("\n"),
    );

    const html = clipboard?.getData("text/html") ?? "";
    const parsed = document.createElement("div");
    parsed.innerHTML = html;
    expect(parsed.textContent).toContain("Protected");
    expect(
      parsed.querySelector("[data-content-guard-attribution]"),
    ).not.toBeNull();
    expect(parsed.querySelector("a")?.href).toBe("https://example.com/article");
  });

  it("constructs attribution values as text instead of injected HTML", () => {
    start("copyright", {
      copyright: {
        owner: `zherunliu<img src=x onerror="alert(1)">`,
        year: 2026,
      },
      source: {
        title: `</p><img src=x onerror="alert(1)">`,
        url: "https://example.com/article?value=<unsafe>",
      },
    });

    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    const { clipboard } = dispatchCopy(paragraph);
    const parsed = document.createElement("div");
    parsed.innerHTML = clipboard?.getData("text/html") ?? "";

    expect(parsed.querySelector("script")).toBeNull();
    expect(parsed.querySelector("img")).toBeNull();
    expect(parsed.textContent).toContain(
      `zherunliu<img src=x onerror="alert(1)">`,
    );
    expect(parsed.textContent).toContain(`</p><img src=x onerror="alert(1)">`);
  });

  it("treats a custom copyright statement as text", () => {
    start("copyright", {
      copyright: {
        owner: "zherunliu",
        statement: `Rights reserved<script>alert(1)</script>`,
      },
    });
    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    const { clipboard } = dispatchCopy(paragraph);
    const parsed = document.createElement("div");
    parsed.innerHTML = clipboard?.getData("text/html") ?? "";
    expect(parsed.querySelector("script")).toBeNull();
    expect(parsed.textContent).toContain(
      "Rights reserved<script>alert(1)</script>",
    );
  });

  it("fails open when clipboard data is unavailable", () => {
    start();
    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    expect(dispatchCopy(paragraph, false).event.defaultPrevented).toBe(false);
  });

  it("fails open in copyright mode when there is no usable selection", () => {
    start();
    const root = document.querySelector<HTMLElement>(".article");
    if (!root) throw new Error("Fixture is incomplete");
    document.getSelection()?.removeAllRanges();
    expect(dispatchCopy(root).event.defaultPrevented).toBe(false);
  });

  it("blocks copy and copy shortcuts in strict mode", () => {
    start("strict");
    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    expect(dispatchCopy(paragraph).event.defaultPrevented).toBe(true);

    for (const init of [
      { key: "c", ctrlKey: true },
      { key: "C", metaKey: true, repeat: true },
    ]) {
      const event = new KeyboardEvent("keydown", {
        ...init,
        bubbles: true,
        cancelable: true,
      });
      paragraph.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it("ignores unrelated shortcuts and protected shortcuts outside the root", () => {
    const controller = start("strict");
    const outside = document.querySelector<HTMLElement>("#outside");
    const outsideText = outside?.firstChild;
    if (!outside || !outsideText) throw new Error("Fixture is incomplete");
    selectRange(outsideText, 0);

    for (const init of [
      { key: "x", ctrlKey: true },
      { key: "c", ctrlKey: false, metaKey: false },
      { key: "c", metaKey: true },
    ]) {
      const event = new KeyboardEvent("keydown", {
        ...init,
        bubbles: true,
        cancelable: true,
      });
      outside.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }

    controller.update({ mode: "copyright" });
    const copyrightCopyKey = new KeyboardEvent("keydown", {
      key: "c",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    outside.dispatchEvent(copyrightCopyKey);
    expect(copyrightCopyKey.defaultPrevented).toBe(false);
  });

  it("allows strict copy shortcuts when the selection is code", () => {
    start("strict");
    const code = document.querySelector<HTMLElement>("#code");
    const text = code?.firstChild;
    if (!code || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    const event = new KeyboardEvent("keydown", {
      key: "c",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    code.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("allows code and explicit allow regions in both protected modes", () => {
    for (const mode of ["strict", "copyright"] as const) {
      const controller = start(mode);
      for (const selector of ["#code", "#allowed", "#input"]) {
        const element = document.querySelector<HTMLElement>(selector);
        const text = element?.firstChild;
        if (!element) throw new Error("Fixture is incomplete");
        if (text) selectRange(text, 0);
        else document.getSelection()?.removeAllRanges();
        expect(dispatchCopy(element).event.defaultPrevented).toBe(false);
      }
      controller.destroy();
    }
  });

  it("applies protection to a mixed code and prose selection", () => {
    start("strict");
    const code = document.querySelector("#code")?.firstChild;
    const finalText = document.querySelector("#last")?.firstChild;
    const root = document.querySelector<HTMLElement>(".article");
    if (!code || !finalText || !root) throw new Error("Fixture is incomplete");
    selectRange(code, 0, finalText, 5);

    expect(dispatchCopy(root).event.defaultPrevented).toBe(true);
    expect(
      dispatchCopy(document.querySelector<HTMLElement>("#code") ?? root).event
        .defaultPrevented,
    ).toBe(true);
  });

  it("protects a selection crossing the target boundary", () => {
    start("strict");
    const protectedText = document.querySelector("#first")?.firstChild;
    const outsideText = document.querySelector("#outside")?.firstChild;
    const outside = document.querySelector<HTMLElement>("#outside");
    if (!protectedText || !outsideText || !outside) {
      throw new Error("Fixture is incomplete");
    }
    selectRange(protectedText, 0, outsideText, 7);
    expect(dispatchCopy(outside).event.defaultPrevented).toBe(true);
  });

  it("blocks only ordinary context menus in strict mode", () => {
    start("strict");
    const paragraph = document.querySelector<HTMLElement>("#first");
    const link = document.querySelector<HTMLElement>("#link");
    const code = document.querySelector<HTMLElement>("#code");
    if (!paragraph || !link || !code) throw new Error("Fixture is incomplete");

    const ordinary = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    paragraph.dispatchEvent(ordinary);
    expect(ordinary.defaultPrevented).toBe(true);

    for (const element of [link, code]) {
      const event = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
  });

  it("does not restrict context menus in copyright mode", () => {
    start("copyright");
    const paragraph = document.querySelector<HTMLElement>("#first");
    if (!paragraph) throw new Error("Fixture is incomplete");
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    paragraph.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("blocks printing in strict and copyright modes but not off", () => {
    for (const mode of ["strict", "copyright", "off"] as const) {
      const controller = start(mode);
      const event = new KeyboardEvent("keydown", {
        key: "p",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(mode !== "off");
      controller.destroy();
    }
  });

  it("does not affect copy or context menus outside the target", () => {
    start("strict");
    const outside = document.querySelector<HTMLElement>("#outside");
    const text = outside?.firstChild;
    if (!outside || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);

    expect(dispatchCopy(outside).event.defaultPrevented).toBe(false);
    const menu = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    outside.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(false);
  });

  it("updates modes and source without installing duplicate listeners", () => {
    const controller = start("strict");
    controller.update({
      mode: "copyright",
      source: {
        title: "Updated title",
        url: "https://example.com/updated",
      },
    });
    controller.start();

    const paragraph = document.querySelector<HTMLElement>("#first");
    const text = paragraph?.firstChild;
    if (!paragraph || !text) throw new Error("Fixture is incomplete");
    selectRange(text, 0);
    const { clipboard } = dispatchCopy(paragraph);
    expect(clipboard?.getData("text/plain")).toContain("Title: Updated title");
    expect(clipboard?.getData("text/plain")).toContain(
      "Source: https://example.com/updated",
    );

    controller.update({ mode: "off" });
    expect(dispatchCopy(paragraph).event.defaultPrevented).toBe(false);
  });

  it("refreshes replaced SPA roots and restores the old root", () => {
    const controller = start("strict");
    const oldRoot = document.querySelector<HTMLElement>(".article");
    if (!oldRoot) throw new Error("Fixture is incomplete");

    const newRoot = document.createElement("article");
    newRoot.className = "article";
    newRoot.textContent = "New page";
    oldRoot.replaceWith(newRoot);
    controller.refresh();

    expect(oldRoot.dataset.contentGuardMode).toBeUndefined();
    expect(newRoot.dataset.contentGuardMode).toBe("strict");
  });

  it("restores pre-existing attributes and native behavior on destroy", () => {
    const root = document.querySelector<HTMLElement>(".article");
    if (!root) throw new Error("Fixture is incomplete");
    root.dataset.contentGuardMode = "legacy";
    const controller = start("strict");

    controller.destroy();
    controller.destroy();
    expect(controller.started).toBe(false);
    expect(root.dataset.contentGuardMode).toBe("legacy");

    const paragraph = document.querySelector<HTMLElement>("#first");
    expect(paragraph && dispatchCopy(paragraph).event.defaultPrevented).toBe(
      false,
    );
  });

  it("isolates controllers targeting different roots", () => {
    const outside = document.querySelector<HTMLElement>("#outside");
    if (!outside) throw new Error("Fixture is incomplete");
    outside.className = "secondary";

    const first = start("strict");
    const second = start("off", { target: ".secondary" });
    first.destroy();

    expect(outside.dataset.contentGuardMode).toBe("off");
    expect(second.started).toBe(true);
  });
});

describe("content guard styles", () => {
  it("scopes selection rules and protects printing in both active modes", () => {
    expect(styles).toContain('[data-content-guard-mode="strict"]');
    expect(styles).toContain('[data-content-guard-mode="copyright"]');
    expect(styles).toContain("@media print");
    expect(styles).toContain("data-content-guard-print-message");
    expect(styles).not.toMatch(/(^|\s)body\s*\{/);
  });
});
