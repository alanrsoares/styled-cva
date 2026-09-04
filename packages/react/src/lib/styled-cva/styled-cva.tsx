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
  type TailwindComponent,
  type TailwindComponentAllInnerProps,
  type TailwindComponentInnerOtherProps,
  type TailwindComponentInnerProps,
  type TailwindInterface,
  type TailwindPropHelper,
  type TemplateFunction,
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
          const { $as, style = {}, ...props } = baseProps;

          // set FinalElement based on if Element is a TailwindComponent, $as defaults to Element if undefined
          const FinalElement = isTw(Element) ? Element : ($as ?? Element);

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
          const filteredProps = isTw(FinalElement)
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
              {...(isTw(Element) && $as ? { $as } : {})}
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

type CVA<T = unknown> = typeof cva<T>;

type StyledExtension = {
  $as?: ElementKey | ComponentType<any>;
};

// Type for valid withProps input: element props + data-* attributes + variant props
// This type uses a mapped type to only allow valid keys
type ValidElementProps<P> = {
  [K in keyof P as K extends `$${string}` ? never : K]?: P[K];
};

// ValidWithProps includes element props, data attributes, and variant props
type ValidWithProps<P, T> = ValidElementProps<P> & {
  [key: `data-${string}`]: string;
} & Partial<VariantProps<ReturnType<CVA<T>>>>;

// Shared CVA component prop shape (element + variants + $as)
type CVAComponentProps<P, T> = P &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension;

// Cached forward-ref shape so base + withProps return type share one instantiation
type CVAComponent<P, T> = ForwardRefExoticComponent<
  PropsWithoutRef<CVAComponentProps<P, T>> & RefAttributes<HTMLElement>
>;

// Polymorphic props when $as is used with an intrinsic element (e.g. $as="a")
type PolymorphicCVAProps<T, $As extends ElementKey> = PropsWithoutRef<
  JSX.IntrinsicElements[$As] &
    VariantProps<ReturnType<CVA<T>>> &
    StyledExtension & { $as?: $As }
> &
  RefAttributes<HTMLElement>;

// Polymorphic props when $as is used with a custom React component (e.g. $as={Link})
type PolymorphicCustomCVAProps<
  T,
  $As extends ComponentType<any>,
> = PropsWithoutRef<
  ($As extends ComponentType<infer P> ? P : never) &
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

export type ComponentCVAWithPropsReturn<P, T> = CVAComponent<P, T> & {
  // Polymorphic overload for intrinsic HTML elements (e.g., $as="a", $as="button")
  <$As extends ElementKey>(props: PolymorphicCVAProps<T, $As>): ReactElement;
  // Polymorphic overload for custom React components (e.g., $as={Link})
  <$As extends ComponentType<any>>(
    props: PolymorphicCustomCVAProps<T, $As>,
  ): ReactElement;
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
  withProps: <DefaultProps extends ValidWithProps<P, T>>(
    defaultProps: DefaultProps & {
      [K in Exclude<keyof DefaultProps, keyof ValidWithProps<P, T>>]?: never;
    },
  ) => CVAComponent<P, T>;
};

export type CVAWithPropsReturn<
  K extends ElementKey,
  T,
> = ComponentCVAWithPropsReturn<JSX.IntrinsicElements[K], T>;

export interface ComponentTemplateFunction<
  in out P extends object,
  in out O extends object = object,
> extends TemplateFunction<P, O> {
  <T>(
    ...args: Parameters<CVA<T>>
  ): ComponentCVAWithPropsReturn<TailwindPropHelper<P, O>, T>;
  cva: <T>(
    ...args: Parameters<CVA<T>>
  ) => ComponentCVAWithPropsReturn<TailwindPropHelper<P, O>, T>;
}

/** Intrinsic CVA: `tw.button(base, config)` — preferred over `.cva(base, config)`. */
type IntrinsicCVAShorthand<K extends ElementKey> = <T>(
  ...args: Parameters<CVA<T>>
) => CVAWithPropsReturn<K, T>;

type StyledCVAElements = {
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

export type StyledCVA = TailwindInterface &
  StyledCVAElements & {
    <C extends TailwindComponent<any, any>>(
      component: C,
    ): ComponentTemplateFunction<
      TailwindComponentInnerProps<C>,
      TailwindComponentInnerOtherProps<C>
    >;

    <C extends TailwindComponent<any, any>, T>(
      component: C,
      ...args: Parameters<CVA<T>>
    ): ComponentCVAWithPropsReturn<TailwindComponentAllInnerProps<C>, T>;

    <C extends React.ComponentType<any>>(
      component: C,
    ): ComponentTemplateFunction<
      C extends (P?: never) => any
        ? object
        : React.ComponentPropsWithoutRef<C> extends { className?: unknown }
          ? Omit<React.ComponentPropsWithoutRef<C>, "className"> & {
              className?: string;
            }
          : React.ComponentPropsWithoutRef<C>
    >;

    <C extends React.ComponentType<any>, T>(
      component: C,
      ...args: Parameters<CVA<T>>
    ): ComponentCVAWithPropsReturn<
      C extends (P?: never) => any
        ? object
        : React.ComponentPropsWithoutRef<C> extends { className?: unknown }
          ? Omit<React.ComponentPropsWithoutRef<C>, "className"> & {
              className?: string;
            }
          : React.ComponentPropsWithoutRef<C>,
      T
    >;

    <C extends keyof JSX.IntrinsicElements>(
      component: C,
    ): ComponentTemplateFunction<JSX.IntrinsicElements[C]>;

    <C extends keyof JSX.IntrinsicElements, T>(
      component: C,
      ...args: Parameters<CVA<T>>
    ): ComponentCVAWithPropsReturn<JSX.IntrinsicElements[C], T>;
  };

const createCvaImpl = (styledFn: any, Element: any, key?: string) => {
  return (...args: Parameters<CVA>) => {
    const variance = cva(...args);

    type Props = VariantProps<typeof variance> & {
      className?: string;
      ref?: Ref<HTMLElement>;
    } & StyledExtension;

    const StyledComponent = styledFn`` as FC<Props>;

    const WithRef = forwardRef<HTMLElement, Props>(
      ({ className, $as, ...props }: any, ref) => {
        const classNames = cn(variance({ ...props, className }), className);
        const forwardedProps = isTw(Element)
          ? props
          : (Object.fromEntries(
              Object.entries(props).filter(removeTransientProps),
            ) as any);

        return (
          <StyledComponent
            className={classNames}
            {...forwardedProps}
            {...($as !== undefined ? { $as } : {})}
            ref={ref}
          />
        );
      },
    );

    const displayName =
      key != null
        ? `Styled${capitalize(key)}`
        : typeof Element === "string"
          ? `Styled${capitalize(Element)}`
          : `Styled${(Element as any).displayName || (Element as any).name || "Component"}`;

    WithRef.displayName = displayName;
    (WithRef as any)[isTwElement] = true;

    // Add withProps method to the component
    const ComponentWithProps = WithRef as typeof WithRef & {
      withProps: (defaultProps: any) => any;
    };

    ComponentWithProps.withProps = ((defaultProps: any) => {
      const ComponentWithDefaultProps = forwardRef<HTMLElement, Props>(
        (userProps, ref) => {
          // Merge default props with user props (user props take precedence)
          const mergedProps = { ...defaultProps, ...userProps } as Props;
          return <WithRef {...mergedProps} ref={ref} />;
        },
      );

      ComponentWithDefaultProps.displayName = `${displayName}.withProps`;
      (ComponentWithDefaultProps as any)[isTwElement] = true;

      return ComponentWithDefaultProps;
    }) as typeof ComponentWithProps.withProps;

    return ComponentWithProps;
  };
};

const wrapTemplateFunction = (styledFn: any, Element: any, key?: string) => {
  const cvaImpl = createCvaImpl(styledFn, Element, key);

  const wrapped = function (this: unknown, ...args: unknown[]) {
    if (isTaggedTemplateArg(args[0])) {
      return (styledFn as (...a: unknown[]) => unknown).apply(this, args);
    }
    return cvaImpl(...(args as Parameters<CVA>));
  };

  Object.assign(wrapped, styledFn, { cva: cvaImpl });

  return wrapped;
};

export function createStyledCVA(): StyledCVA {
  const styledFnFactory = ((element: any, ...callArgs: any[]) => {
    const styledFn = templateFunctionFactory(element);
    const wrapped = wrapTemplateFunction(
      styledFn,
      element,
      typeof element === "string" ? element : undefined,
    );
    if (callArgs.length > 0) {
      return (wrapped as any)(...callArgs);
    }
    return wrapped;
  }) as any;

  const twCVA = Object.fromEntries(
    domElements.map((key) => [key, styledFnFactory(key)]),
  );

  return Object.assign(styledFnFactory, twCVA) as unknown as StyledCVA;
}

const tw: StyledCVA = createStyledCVA();

export default tw;
