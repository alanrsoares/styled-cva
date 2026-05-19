import {
  type FormatOptions,
  formatClassQuasi,
  getIndentBefore,
  normalizeClasses,
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

function getCvaCallObject(node: AnyNode): AnyNode | null {
  if (node.type !== "CallExpression") return null;
  const callee = (node as { callee?: unknown }).callee;
  if (!isAnyNode(callee) || callee.type !== "MemberExpression") return null;
  const property = (callee as { property?: unknown }).property;
  if (getIdentifierName(property) !== "cva") return null;
  if (rootIdentifier(callee) !== "tw") return null;
  const args = (node as { arguments?: unknown }).arguments;
  if (!Array.isArray(args) || args.length === 0) return null;
  const first = args[0];
  if (!isAnyNode(first) || first.type !== "ObjectExpression") return null;
  return first;
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

function collectCvaEdits(obj: AnyNode): Edit[] {
  const edits: Edit[] = [];
  for (const prop of objectProperties(obj)) {
    const key = propertyKeyName(prop);
    if (!key) continue;
    const value = propertyValue(prop);
    if (!value) continue;
    if (key === "base" && stringLiteralValue(value) != null) {
      const edit = editForStringClassValue(value);
      if (edit) edits.push(edit);
      continue;
    }
    if (key === "variants" && value.type === "ObjectExpression") {
      for (const variantProp of objectProperties(value)) {
        const variantValue = propertyValue(variantProp);
        if (!variantValue || variantValue.type !== "ObjectExpression") continue;
        for (const optionProp of objectProperties(variantValue)) {
          const optionValue = propertyValue(optionProp);
          if (!optionValue || stringLiteralValue(optionValue) == null) continue;
          const edit = editForStringClassValue(optionValue);
          if (edit) edits.push(edit);
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
      const obj = getCvaCallObject(node);
      if (obj) edits.push(...collectCvaEdits(obj));
    }
  });
  return edits;
}

export const transformText = (
  text: string,
  ast: unknown,
  options: FormatOptions,
): string => applyEdits(text, collectEdits(text, ast, options));
