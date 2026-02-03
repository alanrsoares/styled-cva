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
  computed,
  defineComponent,
  h,
  mergeProps,
  type Component,
  type DefineComponent,
  type SetupContext,
} from "vue";

import domElements from "../../domElements";
import {
  isTwElement,
  type AnyTailwindComponent,
  type ElementKey,
  type IntrinsicElementsKeys,
  type IntrinsicElementsTemplateFunctionsMap,
  type JSX,
  type TailwindInterface,
} from "./types";

const isTw = (c: any): c is AnyTailwindComponent => c?.[isTwElement] === true;

const templateFunctionFactory: TailwindInterface = (<
  C extends string | Component,
>(
  Element: C,
) => {
  return (
    template: TemplateStringsArray,
    ...templateElements: ((props: any) => string | undefined | null)[]
  ) => {
    const TwComponentConstructor = (
      styleArray: (Record<string, any> | ((p: any) => Record<string, any>))[] = [],
    ) => {
      const TwComponent = defineComponent({
        name:
          typeof Element === "string"
            ? `Tw${capitalize(Element)}`
            : `TwComponent`,
        inheritAttrs: false,
        setup(_, { slots, attrs }: SetupContext) {
          // Extract $as, class, and style from attrs (Vue doesn't like $ prefixed props)
          const $as = computed(() => (attrs as any).$as ?? Element);
          const classAttr = computed(() => (attrs as any).class ?? "");
          const styleAttr = computed(() => (attrs as any).style);

          const FinalElement = computed(() =>
            isTw(Element) ? Element : $as.value,
          );

          // Compute accumulated styles - reactive
          const withStyles = computed<Record<string, any>>(() =>
            styleArray
              ? styleArray.reduce<Record<string, any>>(
                  (acc, intStyle) =>
                    Object.assign(
                      acc,
                      typeof intStyle === "function"
                        ? intStyle(attrs)
                        : intStyle,
                    ),
                  {},
                )
              : {},
          );

          // Filter out transient props (starting with "$") and class/style unless styling another Tw component
          const filteredAttrs = computed(() => {
            const entries = Object.entries(attrs).filter(
              ([key]) => key !== "class" && key !== "style",
            );
            if (isTw(FinalElement.value) || typeof Element !== "string") {
              return Object.fromEntries(entries);
            }
            return Object.fromEntries(entries.filter(removeTransientProps));
          });

          // Compute class names - reactive
          const computedClass = computed(() =>
            cleanTemplate(
              mergeArrays(
                template,
                templateElements.map((t) => t({ ...attrs, $as: $as.value })),
              ),
              classAttr.value,
            ),
          );

          // Merge styles - reactive
          const mergedStyle = computed(() =>
            typeof styleAttr.value === "object"
              ? { ...withStyles.value, ...styleAttr.value }
              : withStyles.value,
          );

          return () =>
            h(
              FinalElement.value as any,
              {
                ...filteredAttrs.value,
                style: mergedStyle.value,
                class: computedClass.value,
                ...(isTw(Element) ? { $as: $as.value } : {}),
              },
              slots.default?.(),
            );
        },
      });

      // Symbol identifier for detecting tailwind-styled-components
      (TwComponent as any)[isTwElement] = true;

      // withStyle method for chaining
      (TwComponent as any).withStyle = (
        styles: ((p: any) => Record<string, any>) | Record<string, any>,
      ) => TwComponentConstructor(styleArray.concat(styles)) as any;

      return TwComponent;
    };

    return TwComponentConstructor();
  };
}) as any;

const intrinsicElementsMap: IntrinsicElementsTemplateFunctionsMap =
  domElements.reduce(
    (acc, DomElement) => ({
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

type CVA<T = unknown> = typeof cva;

type StyledExtension = {
  $as?: ElementKey | Component;
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
} & Partial<T>;

type CVAWithPropsReturn<K extends ElementKey, T> = DefineComponent<
  JSX.IntrinsicElements[K] & VariantProps<typeof cva> & StyledExtension
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
  ) => DefineComponent<
    JSX.IntrinsicElements[K] & VariantProps<typeof cva> & StyledExtension
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
          } & StyledExtension;

          const StyledComponent = (styledFn as any)``;

          const WithVariants = defineComponent({
            name: `Styled${capitalize(key)}`,
            inheritAttrs: false,
            setup(_, { slots, attrs }) {
              // Extract class from attrs
              const classAttr = computed(() => (attrs as any).class ?? "");

              // Use computed to compute class reactively
              const computedClass = computed(() =>
                cn(variance(attrs as any), classAttr.value),
              );

              return () =>
                h(
                  StyledComponent,
                  { ...attrs, class: computedClass.value },
                  slots.default?.(),
                );
            },
          });

          // Add withProps method to the component
          type ValidPropsForImplementation = ValidElementProps<any> & {
            [key: `data-${string}`]: string;
          } & Partial<VariantProps<typeof variance>>;

          const ComponentWithProps = WithVariants as typeof WithVariants & {
            withProps: <DefaultProps extends ValidPropsForImplementation>(
              defaultProps: DefaultProps,
            ) => DefineComponent<Props>;
          };

          ComponentWithProps.withProps = ((defaultProps: any) => {
            const ComponentWithDefaultProps = defineComponent({
              name: `${WithVariants.name}.withProps`,
              inheritAttrs: false,
              setup(_, { slots, attrs }) {
                // Merge default props with user attrs (user attrs take precedence)
                const merged = computed(() => mergeProps(defaultProps, attrs));
                return () =>
                  h(WithVariants, merged.value, slots.default?.());
              },
            });

            return ComponentWithDefaultProps;
          }) as typeof ComponentWithProps.withProps;

          return ComponentWithProps;
        },
      }),
    ]),
  );

  return Object.assign(tw, twCVA) as StyledCVA;
}
