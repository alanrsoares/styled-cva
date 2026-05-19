export const tokenizeClasses = (s: string): string[] =>
  s.split(/\s+/).filter(Boolean);

export const normalizeClasses = (s: string) => tokenizeClasses(s).join(" ");

export function getIndentBefore(text: string, offset: number): number {
  const prevNewline = text.lastIndexOf("\n", offset - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  let indent = 0;
  for (let i = lineStart; i < offset; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 0x20 || ch === 0x09) indent++;
    else break;
  }
  return indent;
}

export function wrapClassesToWidth(
  classes: string[],
  maxWidth: number,
): string[] {
  if (maxWidth <= 0) return classes.slice();
  const lines: string[] = [];
  let current = "";
  for (const cls of classes) {
    if (!current) {
      current = cls;
      continue;
    }
    if (current.length + 1 + cls.length <= maxWidth) {
      current += " " + cls;
    } else {
      lines.push(current);
      current = cls;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function makeIndent(
  width: number,
  useTabs: boolean,
  tabWidth: number,
): string {
  if (useTabs) {
    const tabs = Math.floor(width / tabWidth);
    const spaces = width % tabWidth;
    return "\t".repeat(tabs) + " ".repeat(spaces);
  }
  return " ".repeat(width);
}

export interface FormatOptions {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
}

export interface FormatResult {
  text: string;
  changed: boolean;
}

export function formatClassQuasi(
  rawClasses: string,
  baseIndent: number,
  prefixLen: number,
  options: FormatOptions,
): FormatResult {
  const classes = tokenizeClasses(rawClasses);
  if (classes.length === 0) return { text: "", changed: rawClasses !== "" };

  const singleLine = classes.join(" ");
  const totalSingle = baseIndent + prefixLen + singleLine.length + 1;

  if (totalSingle <= options.printWidth) {
    return { text: singleLine, changed: singleLine !== rawClasses };
  }

  const innerIndentWidth = baseIndent + options.tabWidth;
  const innerIndent = makeIndent(
    innerIndentWidth,
    options.useTabs,
    options.tabWidth,
  );
  const closingIndent = makeIndent(
    baseIndent,
    options.useTabs,
    options.tabWidth,
  );
  const maxLineWidth = Math.max(1, options.printWidth - innerIndentWidth);
  const lines = wrapClassesToWidth(classes, maxLineWidth);
  const body = lines.map((l) => `${innerIndent}${l}`).join("\n");
  const text = `\n${body}\n${closingIndent}`;
  return { text, changed: text !== rawClasses };
}
