import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { Tabs } from "nextra/components";
import { Hero } from "./components/Hero";

const themeComponents = getThemeComponents();

export function useMDXComponents(components) {
  return {
    ...themeComponents,
    Tabs,
    Hero,
    ...components,
  };
}
