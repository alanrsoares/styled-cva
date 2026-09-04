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
  type JSX,
  type TailwindComponent,
  type TailwindComponentAllInnerProps,
  type TailwindComponentInnerOtherProps,
  type TailwindComponentInnerProps,
  type TailwindInterface,
  type TailwindPropHelper,
  type TemplateFunction,
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
      styleArray: (
        Record<string, any> | ((p: any) => Record<string, any>)
      )[] = [],
    ) => {
      const TwComponent = defineComponent({
        name:
          typeof Element === "string"
            ? `Tw${capitalize(Element)}`
            : `TwComponent`,
        inheritAttrs: false,
        setup(_, { slots, attrs }: SetupContext) {
          // Extract $as, class, and style from attrs (Vue doesn't like $ prefixed props)
          const $as = computed(() => (attrs as any).$as);
          const classAttr = computed(() => (attrs as any).class ?? "");
          const styleAttr = computed(() => (attrs as any).style);

          const FinalElement = computed(() =>
            isTw(Element) ? Element : ($as.value ?? Element),
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
              ([key]) => key !== "class" && key !== "style" && key !== "$as",
            );
            if (isTw(FinalElement.value)) {
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

          return () => {
            const el = FinalElement.value;
            const children = slots.default
              ? typeof el === "string"
                ? slots.default()
                : { default: slots.default }
              : undefined;
            return h(
              el as any,
              {
                ...filteredAttrs.value,
                style: mergedStyle.value,
                class: computedClass.value,
                ...(isTw(Element) && $as.value ? { $as: $as.value } : {}),
              },
              children,
            );
          };
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

type CVA<T = unknown> = typeof cva<T>;

type StyledExtension = {
  $as?: ElementKey | Component;
};

// Type for valid withProps input: element props + data-* attributes + variant props
type ValidElementProps<P> = {
  [K in keyof P as K extends `$${string}` ? never : K]?: P[K];
};

// ValidWithProps includes element props, data-* attributes, and variant props
type ValidWithProps<P, T> = ValidElementProps<P> & {
  [key: `data-${string}`]: string;
} & Partial<VariantProps<ReturnType<CVA<T>>>>;

export type ComponentCVAWithPropsReturn<P, T> = DefineComponent<
  P & VariantProps<ReturnType<CVA<T>>> & StyledExtension
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
  withProps: <DefaultProps extends ValidWithProps<P, T>>(
    defaultProps: DefaultProps & {
      [K in Exclude<keyof DefaultProps, keyof ValidWithProps<P, T>>]?: never;
    },
  ) => DefineComponent<P & VariantProps<ReturnType<CVA<T>>> & StyledExtension>;
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

    <C extends Component>(
      component: C,
    ): ComponentTemplateFunction<Record<string, any>>;

    <C extends Component, T>(
      component: C,
      ...args: Parameters<CVA<T>>
    ): ComponentCVAWithPropsReturn<Record<string, any>, T>;

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
      class?: string;
    } & StyledExtension;

    const StyledComponent = styledFn``;

    const displayName =
      key != null
        ? `Styled${capitalize(key)}`
        : typeof Element === "string"
          ? `Styled${capitalize(Element)}`
          : `Styled${(Element as any).displayName || (Element as any).name || "Component"}`;

    const WithVariants = defineComponent({
      name: displayName,
      inheritAttrs: false,
      setup(_, { slots, attrs }) {
        const classAttr = computed(() => (attrs as any).class ?? "");
        const $as = computed(() => (attrs as any).$as);

        const computedClass = computed(() =>
          cn(variance(attrs as any), classAttr.value),
        );

        const forwardedAttrs = computed(() => {
          const entries = Object.entries(attrs).filter(
            ([k]) => k !== "class" && k !== "$as",
          );
          if (isTw(Element)) {
            return Object.fromEntries(entries);
          }
          return Object.fromEntries(entries.filter(removeTransientProps));
        });

        return () =>
          h(
            StyledComponent,
            {
              ...forwardedAttrs.value,
              class: computedClass.value,
              ...($as.value !== undefined ? { $as: $as.value } : {}),
            },
            slots.default ? { default: slots.default } : undefined,
          );
      },
    });

    (WithVariants as any)[isTwElement] = true;

    // Add withProps method to the component
    type ValidPropsForImplementation = ValidWithProps<any, any>;

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
            h(
              WithVariants,
              merged.value,
              slots.default ? { default: slots.default } : undefined,
            );
        },
      });

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
