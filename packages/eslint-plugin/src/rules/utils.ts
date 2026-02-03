/**
 * Pure helpers for class-string and component-name logic.
 * Exported for unit testing.
 */

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const countClasses = (s: string) =>
  new Set(s.trim().split(/\s+/).filter(Boolean)).size;

export const normalizeClasses = (s: string) =>
  s.split(/\s+/).filter(Boolean).join(" ");

/**
 * Generate a unique styled component name for an element.
 * Mutates `existing` by adding the returned name.
 */
export function generateName(element: string, existing: Set<string>): string {
  const base = `Styled${capitalize(element)}`;
  const name = existing.has(base)
    ? `${base}${Array.from({ length: 100 }, (_, i) => i + 1).find((i) => !existing.has(`${base}${i}`))}`
    : base;
  existing.add(name);
  return name;
}
