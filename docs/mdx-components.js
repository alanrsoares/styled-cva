import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { Tabs } from "nextra/components";

const themeComponents = getThemeComponents();

export function useMDXComponents(components) {
  return {
    ...themeComponents,
    Tabs,
    ...components,
  };
}
