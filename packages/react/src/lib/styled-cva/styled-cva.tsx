/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  forwardRef,
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type FC,
  type ForwardRefExoticComponent,
  type JSX,
  type PropsWithoutRef,
  type Ref,
  type RefAttributes,
} from "react";

import domElements from "../../domElements";
import { cn } from "../cn";
import { cva, type VariantProps } from "../cva";
import { capitalize } from "../utils";
import {
  isTwElement,
  type AnyTailwindComponent,
  type ElementKey,
  type Interpolation,
  type IntrinsicElementsKeys,
  type IntrinsicElementsTemplateFunctionsMap,
  type Nullish,
  type TailwindInterface,
} from "./types";

export const mergeArrays = (
  template: TemplateStringsArray,
  templateElements: Array<Nullish<string>>,
) =>
  template.reduce<string[]>(
    (acc, c, i) => acc.concat(c || [], templateElements[i] || []), //  x || [] to remove false values e.g '', null, undefined. as Array.concat() ignores empty arrays i.e []
    [],
  );

export function cleanTemplate(
  template: Array<Interpolation<any>>,
  inheritedClasses: string = "",
) {
  const newClasses = template
    .join(" ")
    .trim()
    .replace(/\n/g, " ") // replace newline with space
    .replace(/\s{2,}/g, " ") // replace multiple spaces with single space
    .split(" ")
    .filter((c) => c !== ","); // remove comma introduced by template to string

  const inheritedClassesArray = inheritedClasses
    ? inheritedClasses.split(" ")
    : [];

  return cn(
    ...newClasses
      .concat(inheritedClassesArray) // add new classes to inherited classes
      .filter((c: string) => c !== " "), // remove empty classes
  );
}

/**
 * A utility function that strips out transient props from a [key,value] array of props
 *
 * @param {[string, any]} [key]
 * @return boolean
 */
const removeTransientProps = ([key]: [string, any]): boolean =>
  key.charAt(0) !== "$";

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

type CVAWithPropsReturn<K extends ElementKey, T> = ForwardRefExoticComponent<
  PropsWithoutRef<
    JSX.IntrinsicElements[K] &
      VariantProps<ReturnType<CVA<T>>> &
      StyledExtension
  > &
    RefAttributes<HTMLElement>
> & {
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
  ) => ForwardRefExoticComponent<
    PropsWithoutRef<
      JSX.IntrinsicElements[K] &
        VariantProps<ReturnType<CVA<T>>> &
        StyledExtension
    > &
      RefAttributes<HTMLElement>
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
        },
      }),
    ]),
  );

  return Object.assign(tw, twCVA) as StyledCVA;
}
