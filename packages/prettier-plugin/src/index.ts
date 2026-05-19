import type { Parser, Plugin } from "prettier";
import prettierParserBabel from "prettier/plugins/babel.js";
import prettierParserTypescript from "prettier/plugins/typescript.js";

import { transformText } from "./transform.js";
import type { FormatOptions } from "./utils.js";

interface PrettierOptions {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
}

const toFormatOptions = (options: PrettierOptions): FormatOptions => ({
  printWidth: options.printWidth ?? 80,
  tabWidth: options.tabWidth ?? 2,
  useTabs: options.useTabs ?? false,
});

const preprocessWithBabel = async (
  text: string,
  options: PrettierOptions,
  parserName: "babel" | "babel-ts",
): Promise<string> => {
  const parser = prettierParserBabel.parsers[parserName];
  if (!parser) return text;
  try {
    const ast = await parser.parse(text, options as never);
    return transformText(text, ast, toFormatOptions(options));
  } catch {
    return text;
  }
};

const wrapParser = (
  parser: Parser,
  preprocessParser: "babel" | "babel-ts",
): Parser => {
  const previousPreprocess = parser.preprocess;
  return {
    ...parser,
    async preprocess(text: string, options: PrettierOptions) {
      const initial = previousPreprocess
        ? await previousPreprocess(text, options as never)
        : text;
      return preprocessWithBabel(initial, options, preprocessParser);
    },
  };
};

const plugin: Plugin = {
  parsers: {
    babel: wrapParser(prettierParserBabel.parsers.babel!, "babel"),
    "babel-ts": wrapParser(prettierParserBabel.parsers["babel-ts"]!, "babel-ts"),
    typescript: wrapParser(
      prettierParserTypescript.parsers.typescript!,
      "babel-ts",
    ),
  },
};

export default plugin;
