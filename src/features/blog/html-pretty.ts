type Token =
  | { type: "open"; name: string; value: string }
  | { type: "close"; name: string; value: string }
  | { type: "void"; name: string; value: string }
  | { type: "text"; value: string };

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const INLINE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "em",
  "i",
  "img",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);

function tokenizeHtml(input: string): Token[] {
  const tokens: Token[] = [];
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^>]*?)?\/?>/g;
  let lastIndex = 0;

  for (
    let match = tagPattern.exec(input);
    match !== null;
    match = tagPattern.exec(input)
  ) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    const name = match[1].toLowerCase();
    const isClose = raw.startsWith("</");
    const isVoid = !isClose && (raw.endsWith("/>") || VOID_TAGS.has(name));
    tokens.push(
      isClose
        ? { type: "close", name, value: raw }
        : isVoid
          ? { type: "void", name, value: raw }
          : { type: "open", name, value: raw },
    );
    lastIndex = tagPattern.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: "text", value: input.slice(lastIndex) });
  }

  return tokens;
}

/** Indent and line-break raw HTML without pulling in a formatting dependency. */
export function prettyPrintHtml(input: string): string {
  const lines: string[] = [];
  let indent = 0;
  let current = "";
  let preserve = 0;

  const flushLine = (extra = 0) => {
    if (current.trim()) {
      lines.push("  ".repeat(Math.max(0, indent + extra)) + current.trim());
    }
    current = "";
  };

  for (const token of tokenizeHtml(input)) {
    if (token.type === "close") {
      if (token.name === "pre") {
        flushLine();
        preserve = Math.max(0, preserve - 1);
        indent = Math.max(0, indent - 1);
        lines.push("  ".repeat(indent) + token.value);
        continue;
      }
      if (INLINE_TAGS.has(token.name)) {
        current += token.value;
      } else {
        flushLine();
        indent = Math.max(0, indent - 1);
        lines.push("  ".repeat(indent) + token.value);
      }
      continue;
    }

    if (token.type === "open") {
      if (token.name === "pre") {
        flushLine();
        lines.push("  ".repeat(indent) + token.value);
        indent += 1;
        preserve += 1;
        continue;
      }
      if (INLINE_TAGS.has(token.name)) {
        current += token.value;
      } else {
        flushLine();
        lines.push("  ".repeat(indent) + token.value);
        indent += 1;
      }
      continue;
    }

    if (token.type === "void") {
      if (INLINE_TAGS.has(token.name)) {
        current += token.value;
      } else {
        flushLine();
        lines.push("  ".repeat(indent) + token.value);
      }
      continue;
    }

    if (preserve > 0) {
      for (const rawLine of token.value.split("\n")) {
        if (rawLine.trim()) {
          lines.push("  ".repeat(indent) + rawLine);
        }
      }
    } else if (token.value.trim()) {
      current += `${token.value.trim()} `;
    }
  }

  flushLine();
  return lines.join("\n");
}
