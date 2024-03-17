/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const isTwElement = Symbol("isTwElement?");

export type Nullish<T> = T | null | undefined;
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
 * ForwardRef typings
 */
export type TailwindExoticComponent<P> = Pick<
  React.ForwardRefExoticComponent<P>,
  keyof React.ForwardRefExoticComponent<any>
>;

type MergeProps<O extends object, P extends {} = {}> =
  // Distribute unions early to avoid quadratic expansion
  P extends any ? IsAny<P, RemoveIndex<P> & O, P & O> : never;
// RemoveIndex<P> is used to make React.ComponentPropsWithRef typesafe on Tailwind components, delete if causing issues

type TailwindPropHelper<
  P extends {},
  O extends object = {}
  // Pick is needed here to make $as typing work
> = Pick<MergeProps<O, P>, keyof MergeProps<O, P>>;

type TailwindComponentPropsWith$As<
  P extends object,
  O extends object,
  $As extends string | React.ComponentType<any> = React.ComponentType<P>,
  P2 extends {} = $As extends AnyTailwindComponent
    ? TailwindComponentAllInnerProps<$As>
    : $As extends IntrinsicElementsKeys | React.ComponentType<any>
    ? React.ComponentPropsWithRef<$As>
    : never
> = P & O & TailwindPropHelper<P2> & { $as?: $As };

/**
 * An interface represent a component styled by tailwind-styled-components
 *
 * @export
 * @interface TailwindComponent
 * @template P The base react props
 * @template O The props added with the template function.
 */
export type TailwindComponent<
  P extends object,
  O extends object = {}
> = IsTwElement & TailwindComponentBase<P, O> & WithStyle<P, O>;

/**
 * An interface represent a component styled by tailwind-styled-components
 *
 * @export
 * @interface TailwindComponentBase
 * @extends {TailwindExoticComponent<TailwindPropHelper<P, O>>}
 * @template P The base react props
 * @template O The props added with the template function.
 */
export interface TailwindComponentBase<P extends object, O extends object = {}>
  extends TailwindExoticComponent<TailwindPropHelper<P, O>> {
  // add our own fake call signature to implement the polymorphic '$as' prop
  (
    props: TailwindPropHelper<P, O> & { $as?: never | undefined }
  ): React.ReactElement<TailwindPropHelper<P, O>>;

  <$As extends string | React.ComponentType<any> = React.ComponentType<P>>(
    props: TailwindComponentPropsWith$As<P, O, $As>
  ): React.ReactElement<TailwindComponentPropsWith$As<P, O, $As>>;
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
    styles: React.CSSProperties | ((p: P & O & S) => React.CSSProperties)
  ) => TailwindComponent<P, O & S>;
}
/**
 * Generice TailwindComponent
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
  <C extends TailwindComponent<any, any>>(component: C): TemplateFunction<
    TailwindComponentInnerProps<C>,
    TailwindComponentInnerOtherProps<C>
  >;
  <C extends React.ComponentType<any>>(component: C): TemplateFunction<
    // Prevent functional components without props infering props as `unknown`
    C extends (P?: never) => any ? {} : React.ComponentPropsWithoutRef<C>
  >;

  <C extends keyof JSX.IntrinsicElements>(component: C): TemplateFunction<
    JSX.IntrinsicElements[C]
  >;
}
