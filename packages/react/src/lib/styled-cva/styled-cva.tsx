/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  capitalize,
  cleanTemplate,
  cn,
  cva,
  isTaggedTemplateArg,
  mergeArrays,
  removeTransientProps,
  type VariantProps,
} from "@styled-cva/core";
import {
  forwardRef,
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type FC,
  type ForwardRefExoticComponent,
  type JSX,
  type PropsWithoutRef,
  type ReactElement,
  type Ref,
  type RefAttributes,
} from "react";

import domElements from "../../domElements";
import {
  isTwElement,
  type AnyTailwindComponent,
  type ElementKey,
  type IntrinsicElementsKeys,
  type IntrinsicElementsTemplateFunctionsMap,
  type TailwindInterface,
} from "./types";

const isTw = (c: any): c is AnyTailwindComponent => c[isTwElement] === true;

const templateFunctionFactory: TailwindInterface = (<C extends ElementType>(
  Element: C,
) => {
  return (
    template: TemplateStringsArray,
    ...templateElements: ((props: any) => string | undefined | null)[]
  ) => {
    const TwComponentConstructor = (
      styleArray: (CSSProperties | ((p: any) => CSSProperties))[] = [],
    ) => {
      const TwComponent = forwardRef(
        (baseProps: any, ref: any): JSX.Element => {
          const { $as = Element, style = {}, ...props } = baseProps;

          // set FinalElement based on if Element is a TailwindComponent, $as defaults to Element if undefined
          const FinalElement = isTw(Element) ? Element : $as;

          const withStyles: CSSProperties = styleArray
            ? styleArray.reduce<CSSProperties>(
                (acc, intStyle) =>
                  Object.assign(
                    acc,
                    typeof intStyle === "function"
                      ? intStyle(baseProps)
                      : intStyle,
                  ),
                {} as CSSProperties,
              )
            : {};

          // filter out props that starts with "$" props except when styling a tailwind-styled-component
          const filteredProps =
            isTw(FinalElement) || typeof Element !== "string"
              ? props
              : (Object.fromEntries(
                  Object.entries(props).filter(removeTransientProps),
                ) as any);

          return (
            <FinalElement
              // forward props
              {...filteredProps}
              style={{ ...withStyles, ...style }}
              // forward ref
              ref={ref}
              // set class names
              className={cleanTemplate(
                mergeArrays(
                  template,
                  templateElements.map((t) => t({ ...props, $as })),
                ),
                props.className,
              )}
              // forward $as prop when styling a tailwind-styled-component
              {...(isTw(Element) ? { $as } : {})}
            />
          );
        },
      ) as any;
      // symbol identifier for detecting tailwind-styled-components
      TwComponent[isTwElement] = true;
      // This enables the react tree to show a name in devtools, much better debugging experience Note: Far from perfect, better implementations welcome
      if (typeof Element !== "string") {
        TwComponent.displayName =
          (Element as any).displayName ||
          (Element as any).name ||
          "tw.Component";
      } else {
        TwComponent.displayName = "tw." + Element;
      }
      TwComponent.withStyle = (
        styles: ((p: any) => CSSProperties) | CSSProperties,
      ) => TwComponentConstructor(styleArray.concat(styles)) as any;

      return TwComponent;
    };
    return TwComponentConstructor();
  };
}) as any;

const intrinsicElementsMap = domElements.reduce(
  <K extends IntrinsicElementsKeys>(
    acc: IntrinsicElementsTemplateFunctionsMap,
    DomElement: K,
  ) => ({
    ...acc,
    [DomElement]: templateFunctionFactory(DomElement),
  }),
  {} as IntrinsicElementsTemplateFunctionsMap,
);

const tw: TailwindInterface = Object.assign(
  templateFunctionFactory,
  intrinsicElementsMap,
);

export default tw;

type CVA<T = unknown> = typeof cva<T>;

type StyledExtension = {
  $as?: ElementKey | ComponentType<any>;
};

// Type for valid withProps input: element props + data-* attributes + variant props
// This type uses a mapped type to only allow valid keys
type ValidElementProps<K extends ElementKey> = {
  [P in keyof JSX.IntrinsicElements[K] as P extends `$${string}`
    ? never
    : P]?: JSX.IntrinsicElements[K][P];
};

// ValidWithProps includes element props, data attributes, and variant props
type ValidWithProps<K extends ElementKey, T> = ValidElementProps<K> & {
  [key: `data-${string}`]: string;
} & Partial<VariantProps<ReturnType<CVA<T>>>>;

// Shared CVA component prop shape (element + variants + $as)
type CVAComponentProps<K extends ElementKey, T> = JSX.IntrinsicElements[K] &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension;

// Cached forward-ref shape so base + withProps return type share one instantiation
type CVAComponent<K extends ElementKey, T> = ForwardRefExoticComponent<
  PropsWithoutRef<CVAComponentProps<K, T>> & RefAttributes<HTMLElement>
>;

// Polymorphic props when $as is used with an intrinsic element (e.g. $as="a")
type PolymorphicCVAProps<T, $As extends ElementKey> = PropsWithoutRef<
  JSX.IntrinsicElements[$As] &
    VariantProps<ReturnType<CVA<T>>> &
    StyledExtension & { $as?: $As }
> &
  RefAttributes<HTMLElement>;

// Capture all transient ($-prefixed) props from the source component, regardless
// of the variant key name ($variant, $size, $tone, …). This preserves variant
// typing when rendering polymorphically as a custom React component.
type ExtractTransientProps<P> = {
  [K in keyof P as K extends `$${string}` ? K : never]?: P[K];
};

/**
 * Utility type to create polymorphic props for custom React components.
 * Use this when you need to render a CVA component as a custom React component
 * (e.g., TanStack Router's Link, Next.js Link, etc.)
 *
 * Note: The component will accept custom React components at runtime, but TypeScript
 * requires using this utility type for full type safety with custom component props.
 *
 * @example
 * ```tsx
 * import { Link, type LinkProps } from '@tanstack/react-router';
 * import type { PolymorphicComponentProps } from '@styled-cva/react';
 *
 * const StyledButton = tw.button.cva("btn-base", {
 *   variants: {
 *     $variant: { primary: "btn-primary", secondary: "btn-secondary" }
 *   }
 * });
 *
 * // Option 1: Simple usage (works at runtime, TypeScript may show warnings)
 * <StyledButton $as={Link} to="/about" $variant="primary">Link</StyledButton>
 *
 * // Option 2: Type-safe with explicit typing
 * type StyledLinkProps = PolymorphicComponentProps<
 *   typeof StyledButton,
 *   typeof Link
 * > & LinkProps;
 *
 * const StyledLink = (props: StyledLinkProps) => <StyledButton {...props} />;
 * ```
 */
export type PolymorphicComponentProps<
  Component extends ForwardRefExoticComponent<any>,
  $As extends ComponentType<any>,
> = PropsWithoutRef<
  ($As extends ComponentType<infer P> ? P : never) &
    (Component extends ForwardRefExoticComponent<infer P>
      ? ExtractTransientProps<P>
      : object) & { $as?: $As }
> &
  RefAttributes<HTMLElement>;

type CVAWithPropsReturn<K extends ElementKey, T> = CVAComponent<K, T> & {
  // Polymorphic overload for intrinsic HTML elements (e.g., $as="a", $as="button")
  <$As extends ElementKey>(props: PolymorphicCVAProps<T, $As>): ReactElement;
  /**
   * Sets default props for the component. User-provided props will override these defaults.
   *
   * @param defaultProps - An object containing default props to apply to the component.
   *                       Accepts known element props, data-* attributes, and variant props.
   *                       Variant prop values are validated against the variant definitions.
   * @returns A component with the default props applied
   *
   * @example
   * ```tsx
   * const StyledButton = tw.button.cva("btn-base", {
   *   variants: {
   *     $variant: {
   *       primary: "btn-primary",
   *       secondary: "btn-secondary",
   *     },
   *   },
   * }).withProps({
   *   'data-some-prop': 'some-value',
   *   type: 'button',
   *   $variant: 'primary' // Valid variant value
   * });
   *
   * // The component will have data-some-prop="some-value", type="button", and $variant="primary" by default
   * <StyledButton>Click me</StyledButton>
   * ```
   */
  withProps: <DefaultProps extends ValidWithProps<K, T>>(
    defaultProps: DefaultProps & {
      [P in Exclude<keyof DefaultProps, keyof ValidWithProps<K, T>>]?: never;
    },
  ) => CVAComponent<K, T>;
};

/** Intrinsic CVA: `tw.button(base, config)` — preferred over `.cva(base, config)`. */

type IntrinsicCVAShorthand<K extends ElementKey> = <T>(
  ...args: Parameters<CVA<T>>
) => CVAWithPropsReturn<K, T>;

export type StyledCVA = TailwindInterface & {
  [K in ElementKey]: TailwindInterface[K] & {
    /**
     * @deprecated Prefer intrinsic CVA shorthand — call `tw.button(base, config)` instead of
     * `tw.button.cva(base, config)` (same types and runtime).
     *
     * @param args - `cva` arguments (`base` classes + config)
     * @returns A styled component with variant props and `.withProps()`
     *
     * @example Shorthand (preferred)
     * ```tsx
     * const StyledButton = tw.button("btn-base", {
     *   variants: {
     *     $variant: { primary: "btn-primary", secondary: "btn-secondary" },
     *   },
     * });
     * ```
     */
    cva: <T>(...args: Parameters<CVA<T>>) => CVAWithPropsReturn<K, T>;
  } & IntrinsicCVAShorthand<K>;
};

export function createStyledCVA(): StyledCVA {
  const twCVA = Object.fromEntries(
    Object.entries(tw).map(([key, styledFn]) => {
      const cvaImpl = (...args: Parameters<CVA>) => {
        const variance = cva(...args);

        type Props = VariantProps<typeof variance> & {
          className?: string;
          ref?: Ref<HTMLElement>;
        } & StyledExtension;

        const StyledComponent = styledFn`` as FC<Props>;

        const WithRef = forwardRef<HTMLElement, Props>(
          ({ className, ...props }, ref) => (
            <StyledComponent
              className={cn(variance({ ...props, className }), className)}
              {...props}
              ref={ref}
            />
          ),
        );

        WithRef.displayName = `Styled${capitalize(key)}`;

        // Add withProps method to the component
        // Type constraint is enforced by the type definition (ValidWithProps<K, T>)
        // Implementation uses 'as any' to match the type signature while allowing runtime flexibility
        // We use the variance type to get the correct variant props
        type ValidPropsForImplementation = ValidElementProps<
          typeof key & ElementKey
        > & {
          [key: `data-${string}`]: string;
        } & Partial<VariantProps<typeof variance>>;

        const ComponentWithProps = WithRef as typeof WithRef & {
          withProps: <DefaultProps extends ValidPropsForImplementation>(
            defaultProps: DefaultProps,
          ) => ForwardRefExoticComponent<
            PropsWithoutRef<Props> & RefAttributes<HTMLElement>
          >;
        };

        ComponentWithProps.withProps = ((defaultProps: any) => {
          const ComponentWithDefaultProps = forwardRef<HTMLElement, Props>(
            (userProps, ref) => {
              // Merge default props with user props (user props take precedence)
              const mergedProps = { ...defaultProps, ...userProps } as Props;
              return <WithRef {...mergedProps} ref={ref} />;
            },
          );

          ComponentWithDefaultProps.displayName = `${WithRef.displayName}.withProps`;

          return ComponentWithDefaultProps;
        }) as typeof ComponentWithProps.withProps;

        return ComponentWithProps;
      };

      const wrapped = function (this: unknown, ...args: unknown[]) {
        if (isTaggedTemplateArg(args[0])) {
          return (styledFn as (...a: unknown[]) => unknown).apply(this, args);
        }
        return cvaImpl(...(args as Parameters<CVA>));
      };

      Object.assign(wrapped, styledFn, { cva: cvaImpl });

      return [key, wrapped];
    }),
  );

  return Object.assign(tw, twCVA) as unknown as StyledCVA;
}
