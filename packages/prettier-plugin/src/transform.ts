import {
  formatClassQuasi,
  getIndentBefore,
  normalizeClasses,
  type FormatOptions,
} from "./utils.js";

interface AnyNode {
  type: string;
  start?: number;
  end?: number;
  [key: string]: unknown;
}

interface Edit {
  start: number;
  end: number;
  replacement: string;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isAnyNode = (v: unknown): v is AnyNode =>
  isObject(v) && typeof (v as { type?: unknown }).type === "string";

function isStaticTemplate(quasi: unknown): quasi is AnyNode {
  if (!isAnyNode(quasi) || quasi.type !== "TemplateLiteral") return false;
  const expressions = (quasi as { expressions?: unknown }).expressions;
  return Array.isArray(expressions) && expressions.length === 0;
}

function walk(node: unknown, visit: (n: AnyNode) => void): void {
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  if (!isAnyNode(node)) return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "range") continue;
    walk((node as Record<string, unknown>)[key], visit);
  }
}

function getIdentifierName(node: unknown): string | null {
  if (!isAnyNode(node)) return null;
  if (node.type !== "Identifier") return null;
  const name = (node as { name?: unknown }).name;
  return typeof name === "string" ? name : null;
}

function rootIdentifier(node: unknown): string | null {
  let current: unknown = node;
  while (isAnyNode(current)) {
    if (current.type === "Identifier") return getIdentifierName(current);
    if (current.type === "MemberExpression") {
      current = (current as { object?: unknown }).object;
      continue;
    }
    if (current.type === "CallExpression") {
      current = (current as { callee?: unknown }).callee;
      continue;
    }
    return null;
  }
  return null;
}

function isStyledTwTag(tag: unknown): boolean {
  if (!isAnyNode(tag)) return false;
  if (tag.type !== "MemberExpression" && tag.type !== "CallExpression") {
    return false;
  }
  return rootIdentifier(tag) === "tw";
}

interface CvaCall {
  base: AnyNode | null;
  config: AnyNode | null;
}

const asObject = (node: unknown): AnyNode | null =>
  isAnyNode(node) && node.type === "ObjectExpression" ? node : null;

/**
 * Resolve the `(base, config)` arguments of a styled-cva call in any of its
 * four shapes: `tw.tag(base, c)`, `tw(Component, base, c)`, and the deprecated
 * `tw.tag.cva(base, c)` / `tw(Component).cva(base, c)`.
 */
function getCvaCall(node: AnyNode): CvaCall | null {
  if (node.type !== "CallExpression") return null;
  const callee = (node as { callee?: unknown }).callee;
  const args = (node as { arguments?: unknown }).arguments;
  if (!isAnyNode(callee) || !Array.isArray(args)) return null;
  if (rootIdentifier(callee) !== "tw") return null;

  // `tw(Component, base, config)`
  if (callee.type === "Identifier") {
    return args.length >= 3
      ? { base: isAnyNode(args[1]) ? args[1] : null, config: asObject(args[2]) }
      : null;
  }
  if (callee.type !== "MemberExpression") return null;

  // `tw.tag(base, config)` or `….cva(base, config)`
  const property = (callee as { property?: unknown }).property;
  const object = (callee as { object?: unknown }).object;
  const isCva = getIdentifierName(property) === "cva";
  const isShorthand = getIdentifierName(object) === "tw";
  if (!isCva && !isShorthand) return null;
  if (args.length < 2) return null;
  return {
    base: isAnyNode(args[0]) ? args[0] : null,
    config: asObject(args[1]),
  };
}

const objectProperties = (obj: AnyNode): AnyNode[] => {
  const props = (obj as { properties?: unknown }).properties;
  return Array.isArray(props) ? props.filter(isAnyNode) : [];
};

function propertyKeyName(prop: AnyNode): string | null {
  if (prop.type !== "ObjectProperty" && prop.type !== "Property") return null;
  const key = (prop as { key?: unknown }).key;
  if (!isAnyNode(key)) return null;
  if (key.type === "Identifier") return getIdentifierName(key);
  if (key.type === "StringLiteral" || key.type === "Literal") {
    const value = (key as { value?: unknown }).value;
    return typeof value === "string" ? value : null;
  }
  return null;
}

const propertyValue = (prop: AnyNode): AnyNode | null => {
  const value = (prop as { value?: unknown }).value;
  return isAnyNode(value) ? value : null;
};

function stringLiteralValue(node: AnyNode): string | null {
  if (node.type !== "StringLiteral" && node.type !== "Literal") return null;
  const value = (node as { value?: unknown }).value;
  return typeof value === "string" ? value : null;
}

function editForTaggedTemplate(
  text: string,
  quasi: AnyNode,
  tagStart: number,
  options: FormatOptions,
): Edit | null {
  if (quasi.start == null || quasi.end == null) return null;
  const innerStart = quasi.start + 1;
  const innerEnd = quasi.end - 1;
  if (innerEnd < innerStart) return null;
  const raw = text.slice(innerStart, innerEnd);
  const baseIndent = getIndentBefore(text, tagStart);
  const prefixLen = quasi.start - tagStart + 1;
  const result = formatClassQuasi(raw, baseIndent, prefixLen, options);
  if (!result.changed) return null;
  return { start: innerStart, end: innerEnd, replacement: result.text };
}

function editForStringClassValue(node: AnyNode): Edit | null {
  if (node.start == null || node.end == null) return null;
  const raw = stringLiteralValue(node);
  if (raw == null) return null;
  const normalized = normalizeClasses(raw);
  if (normalized === raw) return null;
  return {
    start: node.start + 1,
    end: node.end - 1,
    replacement: normalized,
  };
}

function collectCvaEdits({ base, config }: CvaCall): Edit[] {
  const edits: Edit[] = [];
  // A class value is a string, or an array whose string elements are class
  // values (`ClassValue` accepts both).
  const push = (node: AnyNode | null): void => {
    if (!node) return;
    if (node.type === "ArrayExpression") {
      const elements = (node as { elements?: unknown }).elements;
      for (const element of Array.isArray(elements) ? elements : []) {
        push(isAnyNode(element) ? element : null);
      }
      return;
    }
    if (stringLiteralValue(node) == null) return;
    const edit = editForStringClassValue(node);
    if (edit) edits.push(edit);
  };
  push(base);
  if (!config) return edits;
  for (const prop of objectProperties(config)) {
    const key = propertyKeyName(prop);
    const value = propertyValue(prop);
    if (!key || !value) continue;
    if (key === "variants" && value.type === "ObjectExpression") {
      for (const variantProp of objectProperties(value)) {
        const variantValue = propertyValue(variantProp);
        if (!variantValue || variantValue.type !== "ObjectExpression") continue;
        for (const optionProp of objectProperties(variantValue)) {
          push(propertyValue(optionProp));
        }
      }
    }
    if (key === "compoundVariants" && value.type === "ArrayExpression") {
      const elements = (value as { elements?: unknown }).elements;
      for (const element of Array.isArray(elements) ? elements : []) {
        const entry = asObject(element);
        if (!entry) continue;
        for (const entryProp of objectProperties(entry)) {
          const entryKey = propertyKeyName(entryProp);
          if (entryKey === "class" || entryKey === "className") {
            push(propertyValue(entryProp));
          }
        }
      }
    }
  }
  return edits;
}

function applyEdits(text: string, edits: Edit[]): string {
  if (edits.length === 0) return text;
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = text;
  let lastStart = Infinity;
  for (const edit of sorted) {
    if (edit.end > lastStart) continue;
    out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
    lastStart = edit.start;
  }
  return out;
}

export function collectEdits(
  text: string,
  ast: unknown,
  options: FormatOptions,
): Edit[] {
  const edits: Edit[] = [];
  walk(ast, (node) => {
    if (node.type === "TaggedTemplateExpression") {
      const tag = (node as { tag?: unknown }).tag;
      const quasi = (node as { quasi?: unknown }).quasi;
      if (!isStyledTwTag(tag) || !isStaticTemplate(quasi)) return;
      if (!isAnyNode(tag) || tag.start == null) return;
      const edit = editForTaggedTemplate(text, quasi, tag.start, options);
      if (edit) edits.push(edit);
      return;
    }
    if (node.type === "CallExpression") {
      const call = getCvaCall(node);
      if (call) edits.push(...collectCvaEdits(call));
    }
  });
  return edits;
}

export const transformText = (
  text: string,
  ast: unknown,
  options: FormatOptions,
): string => applyEdits(text, collectEdits(text, ast, options));
