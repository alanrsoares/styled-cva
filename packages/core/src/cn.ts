import { cn as baseCn } from "cn";

/**
 * Tailwind CSS classnames combiner
 * @param inputs
 * @returns Tailwind CSS classnames
 *
 * @example
 * ```ts
 * import { cn } from "@styled-cva/core";
 *
 * const className = cn("text-red-500", "bg-blue-500");
 * // className = "text-red-500 bg-blue-500"
 * ```
 */
export const cn = baseCn;

