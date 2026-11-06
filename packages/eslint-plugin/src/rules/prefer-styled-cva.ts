import type { Rule, SourceCode } from "eslint";
import type { Program } from "estree";
import type {
  JSXAttribute,
  JSXElement,
  JSXOpeningElement,
  Node,
} from "estree-jsx";

import { countClasses, generateName, normalizeClasses } from "./utils.js";

type ASTNode = Node & { parent?: ASTNode; range?: [number, number] };
type AST = Program & {
  body: Array<Program["body"][number] & { range?: [number, number] }>;
};

const isStringLiteral = (node: { type: string; value?: unknown }) =>
  node.type === "Literal" && typeof node.value === "string";

const isStaticTemplateLiteral = (node: {
  type: string;
  expressions?: unknown[];
}) => node.type === "TemplateLiteral" && node.expressions?.length === 0;

const getClassString = (attr: JSXAttribute): string | null => {
  const { value } = attr;
  if (!value) return null;

  if (value.type === "Literal" && typeof value.value === "string")
    return value.value;

  if (value.type === "JSXExpressionContainer") {
    const { expression: expr } = value;
    if (isStaticTemplateLiteral(expr)) {
      return (expr as { quasis: Array<{ value: { cooked: string } }> }).quasis
        .map((q) => q.value.cooked)
        .join("");
    }
    if (isStringLiteral(expr)) return (expr as { value: string }).value;
  }
  return null;
};

/**
 * Every name bound in any scope of the file, plus globals it reads. The new
 * component is declared at module scope, so a name bound in an inner scope
 * would shadow it where the element is.
 */
const collectExistingNames = (
  scopeManager: SourceCode["scopeManager"],
): Set<string> =>
  new Set([
    ...scopeManager.scopes.flatMap((scope) =>
      scope.variables.map((v) => v.name),
    ),
    ...scopeManager.globalScope!.through.map((ref) => ref.identifier.name),
  ]);

/** Names bound or read at module scope, where the `tw` import goes. */
const collectModuleNames = (
  scopeManager: SourceCode["scopeManager"],
): Set<string> => {
  const global = scopeManager.globalScope!;
  const moduleScope = global.childScopes.find((c) => c.type === "module");
  return new Set([
    ...global.variables.map((v) => v.name),
    ...(moduleScope?.variables.map((v) => v.name) ?? []),
    ...global.through.map((ref) => ref.identifier.name),
  ]);
};

/**
 * The module-level statement that holds `node`. The styled component goes
 * before it: a declaration inside any function (a component or a local
 * render helper) makes a new component type per render, and React remounts
 * the element each time.
 */
const findTopLevelStatement = (node: ASTNode): ASTNode | null => {
  let current: ASTNode | undefined = node;
  while (current?.parent) {
    if (current.parent.type === "Program") return current;
    current = current.parent;
  }
  return null;
};

const STYLED_PACKAGES = new Set([
  "styled-cva",
  "@styled-cva/react",
  "@styled-cva/solid",
  "@styled-cva/vue",
]);

/** Local name of an existing default import from any styled-cva adapter. */
const findTwImportName = (ast: AST): string | undefined =>
  ast.body
    .filter((n) => n.type === "ImportDeclaration")
    .filter((n) => STYLED_PACKAGES.has(String(n.source.value)))
    .flatMap((n) => n.specifiers)
    .find((s) => s.type === "ImportDefaultSpecifier")?.local.name;

const freeName = (base: string, taken: Set<string>): string => {
  if (!taken.has(base)) return base;
  let i = 1;
  while (taken.has(`${base}${i}`)) i++;
  return `${base}${i}`;
};

/** End of the leading directive prologue (`"use client";`), or 0. */
const getDirectivesEnd = (ast: AST): number => {
  let end = 0;
  for (const n of ast.body) {
    if (n.type !== "ExpressionStatement" || !("directive" in n)) break;
    end = n.range?.[1] ?? end;
  }
  return end;
};

const getLastImportEnd = (ast: AST) =>
  ast.body.filter((n) => n.type === "ImportDeclaration").at(-1)?.range?.[1] ??
  0;

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Suggest extracting JSX elements with many Tailwind classes into styled-cva components",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: { threshold: { type: "integer", minimum: 1, default: 5 } },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyClasses:
        "Element <{{element}}> has {{count}} classes (threshold: {{threshold}}). Extract to styled-cva.",
    },
  },

  create(context) {
    const threshold =
      (context.options[0] as { threshold?: number })?.threshold ?? 5;
    const { sourceCode } = context;
    const ast = sourceCode.ast as AST;
    const existingNames = collectExistingNames(sourceCode.scopeManager);
    const existingTwName = findTwImportName(ast);
    const twName =
      existingTwName ??
      freeName("tw", collectModuleNames(sourceCode.scopeManager));

    return {
      JSXAttribute(node: Rule.Node) {
        const attr = node as unknown as JSXAttribute & ASTNode;
        if (
          attr.name.type !== "JSXIdentifier" ||
          attr.name.name !== "className"
        )
          return;

        const classString = getClassString(attr);
        if (!classString || countClasses(classString) <= threshold) return;

        const openingElement = attr.parent as unknown as JSXOpeningElement &
          ASTNode;
        if (openingElement.name.type !== "JSXIdentifier") return;

        const elementName = openingElement.name.name;
        if (!elementName || /^[A-Z]/.test(elementName)) return;

        context.report({
          node,
          messageId: "tooManyClasses",
          data: {
            element: elementName,
            count: String(countClasses(classString)),
            threshold: String(threshold),
          },
          fix(fixer) {
            const componentName = generateName(elementName, existingNames);
            const styledDecl = `const ${componentName} = ${twName}.${elementName}\`${normalizeClasses(classString)}\`;\n\n`;
            const importEnd = getLastImportEnd(ast) || getDirectivesEnd(ast);
            const insertionPoint =
              findTopLevelStatement(attr)?.range?.[0] ??
              (importEnd > 0 ? importEnd + 1 : 0);

            const fixes: Rule.Fix[] = [];

            if (existingTwName === undefined) {
              const twImport = `import ${twName} from "@styled-cva/react";`;
              fixes.push(
                importEnd > 0
                  ? fixer.insertTextAfterRange(
                      [importEnd, importEnd],
                      `\n${twImport}`,
                    )
                  : fixer.insertTextBeforeRange([0, 0], `${twImport}\n\n`),
              );
            }

            fixes.push(
              fixer.insertTextBeforeRange(
                [insertionPoint, insertionPoint],
                styledDecl,
              ),
            );
            fixes.push(
              fixer.replaceText(
                openingElement.name as unknown as Rule.Node,
                componentName,
              ),
            );

            const attrIndex = openingElement.attributes.indexOf(attr as never);
            const prevAttr = openingElement.attributes[attrIndex - 1] as
              ASTNode | undefined;
            const nextAttr = openingElement.attributes[attrIndex + 1] as
              ASTNode | undefined;

            if (attrIndex > 0 && prevAttr?.range && attr.range) {
              fixes.push(fixer.removeRange([prevAttr.range[1], attr.range[1]]));
            } else if (nextAttr?.range && attr.range) {
              fixes.push(fixer.removeRange([attr.range[0], nextAttr.range[0]]));
            } else {
              fixes.push(fixer.remove(node));
            }

            const jsxElement = openingElement.parent as unknown as JSXElement &
              ASTNode;
            if (jsxElement.closingElement) {
              fixes.push(
                fixer.replaceText(
                  jsxElement.closingElement.name as unknown as Rule.Node,
                  componentName,
                ),
              );
            }

            return fixes;
          },
        });
      },
    };
  },
};

export default rule;
