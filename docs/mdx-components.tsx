import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { getMDXComponents } from "@/components/mdx";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getMDXComponents({
    ...defaultComponents,
    ...components,
  });
}
