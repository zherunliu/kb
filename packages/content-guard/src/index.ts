export const CONTENT_GUARD_MODES = ["strict", "copyright", "off"] as const;

export type ContentGuardMode = (typeof CONTENT_GUARD_MODES)[number];

export interface ContentGuardSource {
  readonly title: string;
  readonly url: string;
}

export interface CopyrightOptions {
  readonly owner: string;
  readonly year?: number;
  readonly statement?: string;
}

export type ContentGuardTarget =
  | string
  | HTMLElement
  | (() => HTMLElement | null);

export interface ContentGuardOptions {
  readonly target: ContentGuardTarget;
  readonly copyright: CopyrightOptions;
  readonly mode?: ContentGuardMode;
  readonly source?: ContentGuardSource;
  readonly document?: Document;
  readonly allowSelector?: string;
  readonly contextMenuAllowSelector?: string;
  readonly printMessage?: string;
}

export interface ContentGuardUpdate {
  readonly mode?: ContentGuardMode;
  readonly source?: ContentGuardSource;
}

export interface ContentGuardController {
  readonly mode: ContentGuardMode;
  readonly started: boolean;
  start(): void;
  update(update: ContentGuardUpdate): void;
  refresh(): void;
  destroy(): void;
}

const MODE_ATTRIBUTE = "data-content-guard-mode";
const PRINT_MESSAGE_ATTRIBUTE = "data-content-guard-print-message";
const COPYRIGHT_ATTRIBUTE = "data-content-guard-copyright";
const TITLE_ATTRIBUTE = "data-content-guard-title";
const SOURCE_ATTRIBUTE = "data-content-guard-source";

const DEFAULT_ALLOW_SELECTOR = [
  "pre",
  "code",
  "input",
  "textarea",
  "select",
  "option",
  "[contenteditable]:not([contenteditable='false'])",
  "[data-content-guard-allow]",
].join(",");

const DEFAULT_CONTEXT_MENU_ALLOW_SELECTOR = [
  DEFAULT_ALLOW_SELECTOR,
  "a[href]",
  "button",
].join(",");

const DEFAULT_PRINT_MESSAGE =
  "Printing is disabled for this protected content.";
const DEFAULT_PROHIBITION =
  "Unauthorized reproduction or distribution of this content is prohibited without prior written permission.";

interface AttributeSnapshot {
  readonly element: HTMLElement;
  readonly values: ReadonlyMap<string, string | null>;
}

const GUARDED_ATTRIBUTES = [
  MODE_ATTRIBUTE,
  PRINT_MESSAGE_ATTRIBUTE,
  COPYRIGHT_ATTRIBUTE,
  TITLE_ATTRIBUTE,
  SOURCE_ATTRIBUTE,
] as const;

export function isContentGuardMode(value: unknown): value is ContentGuardMode {
  return (
    typeof value === "string" &&
    (CONTENT_GUARD_MODES as readonly string[]).includes(value)
  );
}

export function createContentGuard(
  options: ContentGuardOptions,
): ContentGuardController {
  const owner = options.copyright.owner.trim();
  if (owner.length === 0) {
    throw new TypeError("copyright.owner must not be empty");
  }

  let mode: ContentGuardMode = options.mode ?? "copyright";
  let source = options.source;
  let started = false;
  let activeDocument: Document | null = null;
  let activeRoot: HTMLElement | null = null;
  let snapshot: AttributeSnapshot | null = null;

  const allowSelector = options.allowSelector ?? DEFAULT_ALLOW_SELECTOR;
  const contextMenuAllowSelector =
    options.contextMenuAllowSelector ?? DEFAULT_CONTEXT_MENU_ALLOW_SELECTOR;

  const getDocument = (): Document | null => {
    if (options.document) return options.document;
    if (
      typeof HTMLElement !== "undefined" &&
      options.target instanceof HTMLElement
    ) {
      return options.target.ownerDocument;
    }
    return typeof document === "undefined" ? null : document;
  };

  const resolveRoot = (): HTMLElement | null => {
    const ownerDocument = activeDocument ?? getDocument();
    if (!ownerDocument) return null;

    if (typeof options.target === "string") {
      const candidate = ownerDocument.querySelector(options.target);
      return candidate instanceof HTMLElement ? candidate : null;
    }

    if (typeof options.target === "function") return options.target();
    return options.target;
  };

  const getCopyrightStatement = (): string => {
    if (options.copyright.statement) return options.copyright.statement;
    const year = options.copyright.year ?? new Date().getFullYear();
    return `Copyright © ${year} ${owner}. All rights reserved.\n${DEFAULT_PROHIBITION}`;
  };

  const getSource = (): ContentGuardSource => {
    const ownerDocument = activeDocument ?? getDocument();
    if (source) return source;

    const url = ownerDocument?.location?.href
      ? removeHash(ownerDocument.location.href)
      : "";
    return { title: ownerDocument?.title ?? "", url };
  };

  const restoreRoot = (): void => {
    if (!snapshot) return;
    for (const [attribute, value] of snapshot.values) {
      if (value === null) snapshot.element.removeAttribute(attribute);
      else snapshot.element.setAttribute(attribute, value);
    }
    snapshot = null;
    activeRoot = null;
  };

  const decorateRoot = (root: HTMLElement): void => {
    if (root !== activeRoot) {
      restoreRoot();
      snapshot = {
        element: root,
        values: new Map(
          GUARDED_ATTRIBUTES.map((attribute) => [
            attribute,
            root.getAttribute(attribute),
          ]),
        ),
      };
      activeRoot = root;
    }

    const currentSource = getSource();
    root.setAttribute(MODE_ATTRIBUTE, mode);
    root.setAttribute(
      PRINT_MESSAGE_ATTRIBUTE,
      options.printMessage ?? DEFAULT_PRINT_MESSAGE,
    );
    root.setAttribute(COPYRIGHT_ATTRIBUTE, getCopyrightStatement());
    root.setAttribute(TITLE_ATTRIBUTE, currentSource.title);
    root.setAttribute(SOURCE_ATTRIBUTE, currentSource.url);
  };

  const refresh = (): void => {
    if (!started) return;
    const root = resolveRoot();
    if (!root) {
      restoreRoot();
      return;
    }
    decorateRoot(root);
  };

  const getRoot = (): HTMLElement | null => {
    const resolved = resolveRoot();
    if (resolved !== activeRoot && started) refresh();
    return resolved;
  };

  const getSelection = (): Selection | null =>
    activeDocument?.getSelection() ?? null;

  const isNodeInsideRoot = (node: Node | null, root: HTMLElement): boolean => {
    if (!node) return false;
    const candidate = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    return (
      candidate === root || (candidate !== null && root.contains(candidate))
    );
  };

  const getElement = (node: Node | null): Element | null => {
    if (!node) return null;
    return node instanceof Element ? node : node.parentElement;
  };

  const getEventNode = (target: EventTarget | null): Node | null =>
    target && "nodeType" in target ? (target as Node) : null;

  const closestWithinRoot = (
    node: Node | null,
    selector: string,
    root: HTMLElement,
  ): Element | null => {
    const match = getElement(node)?.closest(selector) ?? null;
    return match && root.contains(match) ? match : null;
  };

  const selectionIntersectsRoot = (
    selection: Selection,
    root: HTMLElement,
  ): boolean => {
    if (selection.rangeCount === 0 || selection.isCollapsed) return false;

    for (let index = 0; index < selection.rangeCount; index += 1) {
      const range = selection.getRangeAt(index);
      if (range.intersectsNode(root)) return true;
    }
    return false;
  };

  const selectionIsAllowed = (
    selection: Selection,
    root: HTMLElement,
  ): boolean => {
    if (selection.rangeCount === 0 || selection.isCollapsed) return false;

    for (let index = 0; index < selection.rangeCount; index += 1) {
      const range = selection.getRangeAt(index);
      const startMatch = closestWithinRoot(
        range.startContainer,
        allowSelector,
        root,
      );
      const endMatch = closestWithinRoot(
        range.endContainer,
        allowSelector,
        root,
      );
      if (!startMatch || startMatch !== endMatch) return false;
    }
    return true;
  };

  const eventTargetIsAllowed = (
    event: Event,
    selector: string,
    root: HTMLElement,
  ): boolean =>
    closestWithinRoot(getEventNode(event.target), selector, root) !== null;

  const selectionOrEventIsProtected = (
    event: Event,
    selection: Selection | null,
    root: HTMLElement,
  ): boolean => {
    if (selection && selectionIntersectsRoot(selection, root)) return true;
    return isNodeInsideRoot(getEventNode(event.target), root);
  };

  const selectionOrEventIsAllowed = (
    event: Event,
    selection: Selection | null,
    root: HTMLElement,
  ): boolean => {
    if (selection && selectionIntersectsRoot(selection, root)) {
      return selectionIsAllowed(selection, root);
    }
    return eventTargetIsAllowed(event, allowSelector, root);
  };

  const createClipboardHtml = (
    selection: Selection,
    currentSource: ContentGuardSource,
    statement: string,
  ): string => {
    const ownerDocument = activeDocument;
    if (!ownerDocument) return "";

    const container = ownerDocument.createElement("div");
    for (let index = 0; index < selection.rangeCount; index += 1) {
      if (index > 0) container.append(ownerDocument.createElement("br"));
      container.append(selection.getRangeAt(index).cloneContents());
    }

    const attribution = ownerDocument.createElement("div");
    attribution.setAttribute("data-content-guard-attribution", "");

    for (const line of statement.split("\n")) {
      const paragraph = ownerDocument.createElement("p");
      paragraph.textContent = line;
      attribution.append(paragraph);
    }

    const title = ownerDocument.createElement("p");
    title.textContent = `Title: ${currentSource.title}`;
    attribution.append(title);

    const sourceParagraph = ownerDocument.createElement("p");
    sourceParagraph.append("Source: ");
    const link = ownerDocument.createElement("a");
    link.href = currentSource.url;
    link.textContent = currentSource.url;
    sourceParagraph.append(link);
    attribution.append(sourceParagraph);

    container.append(attribution);
    return container.innerHTML;
  };

  const handleCopy = (event: ClipboardEvent): void => {
    if (!started || mode === "off") return;

    const root = getRoot();
    const selection = getSelection();
    if (!root || !selectionOrEventIsProtected(event, selection, root)) return;
    if (selectionOrEventIsAllowed(event, selection, root)) return;

    if (mode === "strict") {
      event.preventDefault();
      return;
    }

    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed ||
      !event.clipboardData
    ) {
      return;
    }

    const currentSource = getSource();
    const statement = getCopyrightStatement();
    const attribution = `${statement}\n\nTitle: ${currentSource.title}\nSource: ${currentSource.url}`;
    const selectedText = selection.toString();

    event.clipboardData.setData(
      "text/plain",
      `${selectedText}\n\n${attribution}`,
    );
    event.clipboardData.setData(
      "text/html",
      createClipboardHtml(selection, currentSource, statement),
    );
    event.preventDefault();
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (!started || mode === "off" || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();
    const root = getRoot();
    if (!root) return;

    if (key === "p") {
      event.preventDefault();
      return;
    }

    if (mode !== "strict" || key !== "c") return;

    const selection = getSelection();
    if (!selectionOrEventIsProtected(event, selection, root)) return;
    if (selectionOrEventIsAllowed(event, selection, root)) return;
    event.preventDefault();
  };

  const handleContextMenu = (event: MouseEvent): void => {
    if (!started || mode !== "strict") return;
    const root = getRoot();
    if (!root || !isNodeInsideRoot(getEventNode(event.target), root)) return;
    if (eventTargetIsAllowed(event, contextMenuAllowSelector, root)) return;
    event.preventDefault();
  };

  const start = (): void => {
    if (started) return;
    activeDocument = getDocument();
    if (!activeDocument) return;

    started = true;
    activeDocument.addEventListener("copy", handleCopy, true);
    activeDocument.addEventListener("keydown", handleKeydown, true);
    activeDocument.addEventListener("contextmenu", handleContextMenu, true);
    refresh();
  };

  const update = (updateValue: ContentGuardUpdate): void => {
    if (updateValue.mode !== undefined) mode = updateValue.mode;
    if (updateValue.source !== undefined) source = updateValue.source;
    refresh();
  };

  const destroy = (): void => {
    if (activeDocument && started) {
      activeDocument.removeEventListener("copy", handleCopy, true);
      activeDocument.removeEventListener("keydown", handleKeydown, true);
      activeDocument.removeEventListener(
        "contextmenu",
        handleContextMenu,
        true,
      );
    }
    restoreRoot();
    activeDocument = null;
    started = false;
  };

  return {
    get mode() {
      return mode;
    },
    get started() {
      return started;
    },
    start,
    update,
    refresh,
    destroy,
  };
}

function removeHash(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.href;
  } catch {
    return value.split("#", 1)[0] ?? value;
  }
}
