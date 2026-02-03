/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Component, JSX, ValidComponent } from "solid-js";

export const isTwElement = Symbol("isTwElement?");

export type FalseyValue = undefined | null | false;

export type IsTwElement = { [isTwElement]: true };

export type FlattenInterpolation<P> = ReadonlyArray<Interpolation<P>>;
export type InterpolationValue =
  | string
  | number
  | FalseyValue
  | TailwindComponentInterpolation;

export type Interpolation<P> =
  | InterpolationValue
  | InterpolationFunction<P>
  | FlattenInterpolation<P>;

export type InterpolationFunction<P> = (props: P) => Interpolation<P>;

type TailwindComponentInterpolation = Pick<
  TailwindComponentBase<any, any>,
  keyof TailwindComponentBase<any, any>
>;

export type IntrinsicElementsKeys = keyof JSX.IntrinsicElements;

type IsAny<T, True, False = never> = True | False extends (
  T extends never ? True : False
)
  ? True
  : False;

export type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

/**
 * Solid component type wrapper
 */
export type TailwindSolidComponent<P extends object> = Component<P> & {
  (props: P): JSX.Element;
};

type MergeProps<O extends object, P extends {} = {}> =
  // Distribute unions early to avoid quadratic expansion
  P extends any ? IsAny<P, RemoveIndex<P> & O, P & O> : never;

type TailwindPropHelper<
  P extends {},
  O extends object = {},
  // Pick is needed here to make $as typing work
> = Pick<MergeProps<O, P>, keyof MergeProps<O, P>>;

type TailwindComponentPropsWith$As<
  P extends object,
  O extends object,
  $As extends string | ValidComponent = ValidComponent,
  P2 extends {} = $As extends AnyTailwindComponent
    ? TailwindComponentAllInnerProps<$As>
    : $As extends IntrinsicElementsKeys
      ? JSX.IntrinsicElements[$As]
      : $As extends Component<infer ComponentProps>
        ? ComponentProps
        : never,
> = P & O & TailwindPropHelper<P2> & { $as?: $As };

/**
 * An interface represent a component styled by tailwind-styled-components
 *
 * @export
 * @interface TailwindComponent
 * @template P The base solid props
 * @template O The props added with the template function.
 */
export type TailwindComponent<
  P extends object,
  O extends object = {},
> = IsTwElement & TailwindComponentBase<P, O> & WithStyle<P, O>;

/**
 * An interface represent a component styled by tailwind-styled-components
 *
 * @export
 * @interface TailwindComponentBase
 * @template P The base solid props
 * @template O The props added with the template function.
 */
export interface TailwindComponentBase<P extends object, O extends object = {}>
  extends TailwindSolidComponent<TailwindPropHelper<P, O>> {
  // add our own fake call signature to implement the polymorphic '$as' prop
  (props: TailwindPropHelper<P, O> & { $as?: never | undefined }): JSX.Element;

  <$As extends string | ValidComponent = ValidComponent>(
    props: TailwindComponentPropsWith$As<P, O, $As>,
  ): JSX.Element;
}

/**
 *  An interface represent withStyle functionality
 *
 * @export
 * @interface WithStyle
 * @template P
 * @template O
 */
export interface WithStyle<P extends object, O extends object = {}> {
  withStyle: <S extends object = {}>(
    styles: JSX.CSSProperties | ((p: P & O & S) => JSX.CSSProperties),
  ) => TailwindComponent<P, O & S>;
}

/**
 * Generic TailwindComponent
 */
export type AnyTailwindComponent = TailwindComponent<any, any>;

/**
 * A template function that accepts a template literal of tailwind classes and returns a tailwind-styled-component
 *
 * @export
 * @interface TemplateFunction
 * @template E
 */
export interface TemplateFunction<P extends object, O extends object = {}> {
  (template: TemplateStringsArray): TailwindComponent<P, O>;
  (
    template: TemplateStringsArray | InterpolationFunction<P & O>,
    ...rest: Array<Interpolation<P & O>>
  ): TailwindComponent<P, O>;
  <K extends object>(
    template: TemplateStringsArray | InterpolationFunction<P & O & K>,
    ...rest: Array<Interpolation<P & O & K>>
  ): TailwindComponent<P, O & K>;
}

export type TailwindComponentInnerProps<C extends AnyTailwindComponent> =
  C extends TailwindComponent<infer P, any> ? P : never;

export type TailwindComponentInnerOtherProps<C extends AnyTailwindComponent> =
  C extends TailwindComponent<any, infer O> ? O : never;

export type TailwindComponentAllInnerProps<C extends AnyTailwindComponent> =
  TailwindComponentInnerProps<C> & TailwindComponentInnerOtherProps<C>;

export type IntrinsicElementsTemplateFunctionsMap = {
  [RTag in keyof JSX.IntrinsicElements]: TemplateFunction<
    JSX.IntrinsicElements[RTag]
  >;
};

export interface TailwindInterface
  extends IntrinsicElementsTemplateFunctionsMap {
  /**
   * A factory function that creates a styled component from a wrapped component
   * @example
   * ```tsx
   * const StyledButton = tw.button`bg-blue-500`;
   *
   * const ExtendedStyledButton = tw(StyledButton)`bg-green-500`;
   *
   * // the resulting component will have both classes, with the last one taking precedence
   * ```
   */
  <C extends TailwindComponent<any, any>>(
    component: C,
  ): TemplateFunction<
    TailwindComponentInnerProps<C>,
    TailwindComponentInnerOtherProps<C>
  >;
  /**
   * A factory function that creates a styled component from a wrapped component
   *
   * @example
   * ```tsx
   * const StyledButton = tw.button`bg-blue-500`;
   *
   * const ExtendedStyledButton = tw(StyledButton)`bg-green-500`;
   *
   * // the resulting component will have both classes, with the last one taking precedence
   * ```
   */
  <C extends Component<any>>(
    component: C,
  ): TemplateFunction<
    // Prevent functional components without props inferring props as `unknown`
    C extends (props?: never) => any
      ? {}
      : C extends Component<infer P>
        ? P extends { class?: unknown }
          ? Omit<P, "class"> & { class?: string }
          : P
        : never
  >;
  /**
   * A factory function that creates a styled component from an intrinsic element
   * @example
   * ```tsx
   * const StyledButton = tw.button.cva("btn-base", {});
   * ```
   */
  <C extends keyof JSX.IntrinsicElements>(
    component: C,
  ): TemplateFunction<JSX.IntrinsicElements[C]>;
}

export type ElementKey = keyof TailwindInterface;
