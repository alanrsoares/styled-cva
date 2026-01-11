import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { Callout, Cards, Steps, Tabs } from "nextra/components";

const themeComponents = getThemeComponents();

export function useMDXComponents(components) {
  return {
    ...themeComponents,
    Tabs,
    Callout,
    Cards,
    Steps,
    ...components,
  };
}
