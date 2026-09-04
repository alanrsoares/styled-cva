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
  type IsTwElement,
  type TailwindComponent,
  type TailwindComponentAllInnerProps,
  type TailwindComponentInnerOtherProps,
  type TailwindComponentInnerProps,
  type TailwindInterface,
  type TailwindPropHelper,
  type TemplateFunction,
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
        const FinalElement = createMemo(() =>
          isTw(Element) ? Element : (local.$as ?? Element),
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
          isTw(FinalElement())
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
              templateElements.map((t) => t({ ...props, $as: local.$as })),
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
            {...(isTw(Element) && local.$as ? { $as: local.$as } : {})}
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

type CVA<T = unknown> = typeof cva<T>;

type StyledExtension = {
  $as?: ElementKey | Component<any>;
};

// Type for valid withProps input: element props + data-* attributes + variant props
type ValidElementProps<P> = {
  [K in keyof P as K extends `$${string}` ? never : K]?: P[K];
};

// ValidWithProps includes element props, data attributes, and variant props
type ValidWithProps<P, T> = ValidElementProps<P> & {
  [key: `data-${string}`]: string;
} & Partial<VariantProps<ReturnType<CVA<T>>>>;

// Polymorphic props when $as is used: accept the "as" element's props (e.g. href when $as="a")
type PolymorphicCVAProps<
  T,
  $As extends ElementKey,
> = JSX.IntrinsicElements[$As] &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension & { $as?: $As };

type ComponentCVAProps<P, T> = P &
  VariantProps<ReturnType<CVA<T>>> &
  StyledExtension;

export type ComponentCVAWithPropsReturn<
  P extends object,
  T,
> = TailwindComponent<ComponentCVAProps<P, T>, object> &
  IsTwElement &
  Component<ComponentCVAProps<P, T>> & {
    <$As extends ElementKey>(props: PolymorphicCVAProps<T, $As>): JSX.Element;
    <$As extends ValidComponent>(
      props: ComponentCVAProps<
        $As extends Component<infer CP>
          ? CP
          : JSX.IntrinsicElements[ElementKey],
        T
      > & { $as?: $As },
    ): JSX.Element;
    /**
     * Sets default props for the component. User-provided props will override these defaults.
     *
     * @param defaultProps - An object containing default props to apply to the component.
     *                       Accepts known element props, data-* attributes, and variant props.
     *                       Variant prop values are validated against the variant definitions.
     * @returns A component with the default props applied
     */
    withProps: <DefaultProps extends ValidWithProps<P, T>>(
      defaultProps: DefaultProps & {
        [K in Exclude<keyof DefaultProps, keyof ValidWithProps<P, T>>]?: never;
      },
    ) => Component<ComponentCVAProps<P, T>>;
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

    <C extends Component<any>>(
      component: C,
    ): ComponentTemplateFunction<
      C extends (props?: never) => any
        ? object
        : C extends Component<infer P>
          ? P extends { class?: unknown }
            ? Omit<P, "class"> & { class?: string }
            : P
          : never
    >;

    <C extends Component<any>, T>(
      component: C,
      ...args: Parameters<CVA<T>>
    ): ComponentCVAWithPropsReturn<
      C extends (props?: never) => any
        ? object
        : C extends Component<infer P>
          ? P extends { class?: unknown }
            ? Omit<P, "class"> & { class?: string }
            : P
          : never,
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
      class?: string;
      ref?: any;
    } & StyledExtension;

    const StyledComponent = styledFn`` as Component<Props>;

    const WithVariants: Component<Props> = (rawProps) => {
      const [local, props] = splitProps(rawProps as any, ["class", "$as"]);
      const computedClass = createMemo(() =>
        cn(variance(rawProps as any), local.class),
      );
      const forwardedProps = createMemo(() =>
        isTw(Element)
          ? props
          : (Object.fromEntries(
              Object.entries(props).filter(removeTransientProps),
            ) as any),
      );

      return (
        <StyledComponent
          {...forwardedProps()}
          {...(local.$as !== undefined ? { $as: local.$as } : {})}
          class={computedClass()}
        />
      );
    };

    const displayName =
      key != null
        ? `Styled${capitalize(key)}`
        : typeof Element === "string"
          ? `Styled${capitalize(Element)}`
          : `Styled${(Element as any).displayName || (Element as any).name || "Component"}`;

    (WithVariants as any).displayName = displayName;
    (WithVariants as any)[isTwElement] = true;

    // Add withProps method to the component
    type ValidPropsForImplementation = ValidWithProps<any, any>;

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
