import type { Rule } from "eslint";
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

const collectExistingNames = (ast: AST): Set<string> =>
  new Set(
    ast.body
      .filter(
        (n): n is Program["body"][number] & { type: "VariableDeclaration" } =>
          n.type === "VariableDeclaration",
      )
      .flatMap((n) => n.declarations)
      .filter((d) => d.id?.type === "Identifier")
      .map((d) => (d.id as { name: string }).name),
  );

const isComponentBoundary = (node: ASTNode) =>
  node.type === "FunctionDeclaration" ||
  (node.type === "VariableDeclaration" &&
    "declarations" in node &&
    (node.declarations as Array<{ init?: { type: string } }>)[0]?.init?.type ===
      "ArrowFunctionExpression");

const isExportWrapper = (node?: ASTNode) =>
  node?.type === "ExportDefaultDeclaration" ||
  node?.type === "ExportNamedDeclaration";

const findComponentBoundary = (node: ASTNode): ASTNode | null => {
  let current: ASTNode | undefined = node;
  while (current?.parent) {
    if (isComponentBoundary(current.parent)) {
      return isExportWrapper(current.parent.parent)
        ? current.parent.parent
        : current.parent;
    }
    current = current.parent;
  }
  return null;
};

const STYLED_PACKAGES = ["styled-cva", "@styled-cva/react"] as const;

const hasStyledCvaImport = (ast: AST) =>
  ast.body.some(
    (n) =>
      n.type === "ImportDeclaration" &&
      STYLED_PACKAGES.includes(
        n.source.value as (typeof STYLED_PACKAGES)[number],
      ) &&
      n.specifiers.some(
        (s) => s.type === "ImportDefaultSpecifier" && s.local.name === "tw",
      ),
  );

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
    const existingNames = collectExistingNames(ast);

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
            const styledDecl = `const ${componentName} = tw.${elementName}\`${normalizeClasses(classString)}\`;\n\n`;
            const lastImportEnd = getLastImportEnd(ast);
            const insertionPoint =
              findComponentBoundary(attr)?.range?.[0] ??
              (lastImportEnd > 0 ? lastImportEnd + 1 : 0);

            const fixes: Rule.Fix[] = [];

            if (!hasStyledCvaImport(ast)) {
              fixes.push(
                lastImportEnd > 0
                  ? fixer.insertTextAfterRange(
                      [lastImportEnd, lastImportEnd],
                      `\nimport tw from "@styled-cva/react";`,
                    )
                  : fixer.insertTextBeforeRange(
                      [0, 0],
                      `import tw from "@styled-cva/react";\n\n`,
                    ),
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
              | ASTNode
              | undefined;
            const nextAttr = openingElement.attributes[attrIndex + 1] as
              | ASTNode
              | undefined;

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
