import { cn } from "../cn";

export type Nullish<T> = T | null | undefined;

/**
 * True when `value` is the receiver’s first argument from a tagged template
 * call (`tag\`…\``): a template strings array carrying `raw` segments.
 */
export function isTaggedTemplateArg(
  value: unknown,
): value is TemplateStringsArray {
  return Array.isArray(value) && "raw" in value;
}

/**
 * Merges template literal segments with interpolated values (e.g. from styled tagged templates).
 */
export const mergeArrays = (
  template: TemplateStringsArray,
  templateElements: Array<Nullish<string>>,
): string[] =>
  template.reduce<string[]>(
    (acc, c, i) => acc.concat(c || [], templateElements[i] || []),
    [],
  );

/**
 * Normalizes an array of class values (e.g. from mergeArrays) and merges with inherited classes.
 */
export function cleanTemplate(
  template: Array<string | number | null | undefined>,
  inheritedClasses: string = "",
): string {
  const newClasses = template
    .join(" ")
    .trim()
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .split(" ")
    .filter((c) => c !== ",");

  const inheritedClassesArray = inheritedClasses
    ? inheritedClasses.split(" ")
    : [];

  return cn(
    ...newClasses
      .concat(inheritedClassesArray)
      .filter((c: string) => c !== " "),
  );
}

/**
 * Builds the class-name resolver for one tagged template.
 *
 * A template with no interpolations has a constant class string. That string
 * is cleaned once, on the first call, and reused; only inherited classes are
 * merged per call. A template with interpolations keeps the full per-call
 * clean, because an interpolation can override a later static class.
 */
export function createTemplateClassResolver<P>(
  template: TemplateStringsArray,
  templateElements: ReadonlyArray<(props: P) => Nullish<string>>,
): (props: P, inheritedClasses?: string) => string {
  if (templateElements.length > 0) {
    return (props, inheritedClasses) =>
      cleanTemplate(
        mergeArrays(
          template,
          templateElements.map((t) => t(props)),
        ),
        inheritedClasses,
      );
  }

  let staticClasses: string | undefined;

  return (_props, inheritedClasses) => {
    staticClasses ??= cleanTemplate([...template]);
    return inheritedClasses
      ? cn(staticClasses, inheritedClasses)
      : staticClasses;
  };
}

/**
 * Predicate to filter out transient props (e.g. $variant) so they are not forwarded to the DOM.
 */
export const removeTransientProps = ([key]: [string, unknown]): boolean =>
  key.charAt(0) !== "$";
