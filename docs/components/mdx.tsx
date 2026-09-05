import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

const Callout = defaultMdxComponents.Callout;

export const getMDXComponents = (components?: MDXComponents) => ({
  ...defaultMdxComponents,
  Tab,
  Tabs,
  Step,
  Steps,
  Callout,
  Popup,
  PopupContent,
  PopupTrigger,
  ...components,
} satisfies MDXComponents);

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
