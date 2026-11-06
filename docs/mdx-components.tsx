import { getMDXComponents } from "@/components/mdx";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export const useMDXComponents = (components: MDXComponents): MDXComponents =>
  getMDXComponents({
    ...defaultComponents,
    ...components,
  });
