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
  createMemo,
  mergeProps,
  splitProps,
  type Component,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import domElements from "../../domElements";
import {
  isTwElement,
  type AnyTailwindComponent,
  type ElementKey,
  type IntrinsicElementsKeys,
  type IntrinsicElementsTemplateFunctionsMap,
  type IsTwElement,
  type TailwindComponent,
  type TailwindInterface,
} from "./types";

const isTw = (c: any): c is AnyTailwindComponent => c[isTwElement] === true;

const templateFunctionFactory: TailwindInterface = (<C extends ValidComponent>(
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
type PolymorphicCVAProps<
  T,
  $As extends ElementKey,
> = JSX.IntrinsicElements[$As] &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension & { $as?: $As };

// CVA component props (element + variant + $as); used so tw(CVAComponent) preserves $variant, $size, etc.
type CVAProps<K extends ElementKey, T> = JSX.IntrinsicElements[K] &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension;

// Use `object` (not `Record<string, unknown>`) for the second TailwindComponent
// generic: `Record<string, unknown>` adds an index signature, which widens
// `keyof` inside TailwindPropHelper and collapses variant literal unions
// (e.g. `$variant: "primary" | "secondary"`) to `string` at the JSX call site.
type CVAWithPropsReturn<K extends ElementKey, T> = TailwindComponent<
  CVAProps<K, T>,
  object
> &
  IsTwElement &
  Component<CVAProps<K, T>> & {
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
    ) => Component<CVAProps<K, T>>;
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

          (ComponentWithDefaultProps as any).displayName =
            `${(WithVariants as any).displayName}.withProps`;

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
