/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  capitalize,
  cleanTemplate,
  cn,
  cva,
  mergeArrays,
  removeTransientProps,
  type VariantProps,
} from "@styled-cva/core";
import {
  createMemo,
  type Component,
  type JSX,
  type ValidComponent,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

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

const templateFunctionFactory: TailwindInterface = (<
  C extends ValidComponent,
>(
  Element: C,
) => {
  return (
    template: TemplateStringsArray,
    ...templateElements: ((props: any) => string | undefined | null)[]
  ) => {
    const TwComponentConstructor = (
      styleArray: (JSX.CSSProperties | ((p: any) => JSX.CSSProperties))[] = [],
    ) => {
      const TwComponent = (baseProps: any): JSX.Element => {
        // Split out our special props from the rest
        const [local, props] = splitProps(baseProps, [
          "$as",
          "style",
          "class",
          "ref",
        ]);

        // Determine the final element to render - reactive
        const $as = createMemo(() => local.$as ?? Element);
        const FinalElement = createMemo(() =>
          isTw(Element) ? Element : $as(),
        );

        // Compute accumulated styles - reactive
        const withStyles = createMemo<JSX.CSSProperties>(() =>
          styleArray
            ? styleArray.reduce<JSX.CSSProperties>(
                (acc, intStyle) =>
                  Object.assign(
                    acc,
                    typeof intStyle === "function"
                      ? intStyle(baseProps)
                      : intStyle,
                  ),
                {} as JSX.CSSProperties,
              )
            : {},
        );

        // Filter out transient props (starting with "$") unless styling another Tw component
        // This needs to be reactive to respond to prop changes
        const filteredProps = createMemo(() =>
          isTw(FinalElement()) || typeof Element !== "string"
            ? props
            : (Object.fromEntries(
                Object.entries(props).filter(removeTransientProps),
              ) as any),
        );

        // Compute class names - reactive
        const computedClass = createMemo(() =>
          cleanTemplate(
            mergeArrays(
              template,
              templateElements.map((t) => t({ ...props, $as: $as() })),
            ),
            local.class ?? "",
          ),
        );

        // Merge styles - reactive
        const mergedStyle = createMemo(() =>
          typeof local.style === "object"
            ? { ...withStyles(), ...local.style }
            : withStyles(),
        );

        return (
          <Dynamic
            component={FinalElement()}
            {...filteredProps()}
            style={mergedStyle()}
            ref={local.ref}
            class={computedClass()}
            {...(isTw(Element) ? { $as: $as() } : {})}
          />
        );
      };

      // Symbol identifier for detecting tailwind-styled-components
      (TwComponent as any)[isTwElement] = true;

      // Display name for debugging
      if (typeof Element !== "string") {
        (TwComponent as any).displayName =
          (Element as any).displayName ||
          (Element as any).name ||
          "tw.Component";
      } else {
        (TwComponent as any).displayName = "tw." + Element;
      }

      // withStyle method for chaining
      (TwComponent as any).withStyle = (
        styles: ((p: any) => JSX.CSSProperties) | JSX.CSSProperties,
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
  $as?: ElementKey | Component<any>;
};

// Type for valid withProps input: element props + data-* attributes + variant props
type ValidElementProps<K extends ElementKey> = {
  [P in keyof JSX.IntrinsicElements[K] as P extends `$${string}`
    ? never
    : P]?: JSX.IntrinsicElements[K][P];
};

// ValidWithProps includes element props, data attributes, and variant props
type ValidWithProps<K extends ElementKey, T> = ValidElementProps<K> & {
  [key: `data-${string}`]: string;
} & Partial<VariantProps<ReturnType<CVA<T>>>>;

// Polymorphic props when $as is used: accept the "as" element's props (e.g. href when $as="a")
type PolymorphicCVAProps<T, $As extends ElementKey> = JSX.IntrinsicElements[$As] &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension & { $as?: $As };

type CVAWithPropsReturn<K extends ElementKey, T> = Component<
  JSX.IntrinsicElements[K] & VariantProps<ReturnType<CVA<T>>> & StyledExtension
> & {
  <$As extends ElementKey>(props: PolymorphicCVAProps<T, $As>): JSX.Element;
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
  ) => Component<
    JSX.IntrinsicElements[K] & VariantProps<ReturnType<CVA<T>>> & StyledExtension
  >;
};

export type StyledCVA = TailwindInterface & {
  /**
   * A factory function that creates a styled component with variant props
   */
  [K in ElementKey]: TailwindInterface[K] & {
    /**
     * A factory function that creates a styled component with variant props
     *
     * @param args - a tuple containing the `cva` function arguments
     * @returns A styled component with variant props and a `.withProps()` method
     *
     * @example
     * ```tsx
     * const StyledButton = tw.button.cva("btn-base", {
     *  variants: {
     *  // variant keys starting with $ will not be sent to the DOM,
     *  // this avoids extraneous props warning
     *    $variant: {
     *      primary: "btn-primary",
     *      secondary: "btn-secondary",
     *    },
     *  }
     * });
     *
     * // ...
     *
     * <StyledButton $variant="primary">Click me</StyledButton>
     * ```
     */
    cva: <T>(...args: Parameters<CVA<T>>) => CVAWithPropsReturn<K, T>;
  };
};

export function createStyledCVA(): StyledCVA {
  const twCVA = Object.fromEntries(
    Object.entries(tw).map(([key, styledFn]) => [
      key,
      Object.assign(styledFn, {
        cva: (...args: Parameters<CVA>) => {
          const variance = cva(...args);

          type Props = VariantProps<typeof variance> & {
            class?: string;
            ref?: any;
          } & StyledExtension;

          const StyledComponent = styledFn`` as Component<Props>;

          const WithVariants: Component<Props> = (props) => {
            // Use createMemo to compute class reactively
            // Cast props to any to preserve Solid's reactivity proxy while satisfying CVA's type
            const computedClass = createMemo(() =>
              cn(variance(props as any), props.class),
            );

            return <StyledComponent {...props} class={computedClass()} />;
          };

          (WithVariants as any).displayName = `Styled${capitalize(key)}`;

          // Add withProps method to the component
          type ValidPropsForImplementation = ValidElementProps<any> & {
            [key: `data-${string}`]: string;
          } & Partial<VariantProps<typeof variance>>;

          const ComponentWithProps = WithVariants as typeof WithVariants & {
            withProps: <DefaultProps extends ValidPropsForImplementation>(
              defaultProps: DefaultProps,
            ) => Component<Props>;
          };

          ComponentWithProps.withProps = ((defaultProps: any) => {
            const ComponentWithDefaultProps: Component<Props> = (userProps) => {
              // Merge default props with user props (user props take precedence)
              const merged = mergeProps(defaultProps, userProps) as Props;
              return <WithVariants {...merged} />;
            };

            (ComponentWithDefaultProps as any).displayName = `${(WithVariants as any).displayName}.withProps`;

            return ComponentWithDefaultProps;
          }) as typeof ComponentWithProps.withProps;

          return ComponentWithProps;
        },
      }),
    ]),
  );

  return Object.assign(tw, twCVA) as StyledCVA;
}
