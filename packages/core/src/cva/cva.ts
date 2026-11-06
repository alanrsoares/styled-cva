/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx } from "cn";

import type {
  ClassProp,
  ClassValue,
  OmitUndefined,
  StringToBoolean,
} from "./types";

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  "class" | "className"
>;

const falsyToString = <T>(value: T) =>
  typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;

/* cx
  ============================================ */

export type CxOptions = Parameters<typeof clsx>;
export type CxReturn = ReturnType<typeof clsx>;

export const cx = clsx;

/* cva
  ============================================ */

/**
 * A variant is an object that maps each value to its classes, or a string.
 * A string is a boolean shorthand: `"ring-2"` is `{ true: "ring-2", false: "" }`.
 */
type VariantShape = Record<string, ClassValue> | string;

type ConfigSchema = Record<string, VariantShape>;

type VariantValue<V> = V extends string ? boolean : StringToBoolean<keyof V>;

type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: VariantValue<T[Variant]> | null | undefined;
};
type ConfigVariantsMulti<T extends ConfigSchema> = {
  [Variant in keyof T]?:
    VariantValue<T[Variant]> | VariantValue<T[Variant]>[] | undefined;
};

type NormalizedVariants = Record<string, Record<string, ClassValue>>;

const normalizeVariants = (variants: ConfigSchema): NormalizedVariants =>
  Object.fromEntries(
    Object.entries(variants).map(([name, shape]) => [
      name,
      typeof shape === "string" ? { true: shape, false: "" } : shape,
    ]),
  );

type Config<T> = T extends ConfigSchema
  ? {
      variants?: T;
      defaultVariants?: ConfigVariants<T>;
      compoundVariants?: (T extends ConfigSchema
        ? (ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassProp
        : ClassProp)[];
    }
  : never;

type Props<T> = T extends ConfigSchema
  ? ConfigVariants<T> & ClassProp
  : ClassProp;

export const cva = <T>(base?: ClassValue, config?: Config<T>) => {
  const variants =
    config?.variants == null
      ? undefined
      : normalizeVariants(config.variants as ConfigSchema);

  return (props?: Props<T>) => {
    if (config == null || variants == null)
      return cx(base, props?.class, props?.className);

    const { defaultVariants } = config;

    const getVariantClassNames = Object.keys(variants).map(
      (variant: keyof typeof variants) => {
        const variantProp = props?.[variant as keyof typeof props];
        const defaultVariantProp = defaultVariants?.[variant];

        if (variantProp === null) return null;

        const variantKey = (falsyToString(variantProp) ||
          falsyToString(
            defaultVariantProp,
          )) as keyof (typeof variants)[typeof variant];

        return variants[variant][variantKey];
      },
    );

    const propsWithoutUndefined =
      props &&
      Object.entries(props).reduce(
        (acc, [key, value]) => {
          if (value === undefined) {
            return acc;
          }

          acc[key] = value;
          return acc;
        },
        {} as Record<string, unknown>,
      );

    const getCompoundVariantClassNames = config?.compoundVariants?.reduce(
      (
        acc,
        { class: cvClass, className: cvClassName, ...compoundVariantOptions },
      ) =>
        Object.entries(compoundVariantOptions).every(([key, value]) =>
          Array.isArray(value)
            ? value.includes(
                {
                  ...defaultVariants,
                  ...propsWithoutUndefined,
                }[key],
              )
            : {
                ...defaultVariants,
                ...propsWithoutUndefined,
              }[key] === value,
        )
          ? [...acc, cvClass, cvClassName]
          : acc,
      [] as ClassValue[],
    );

    return cx(
      base,
      getVariantClassNames,
      getCompoundVariantClassNames,
      props?.class,
      props?.className,
    );
  };
};
