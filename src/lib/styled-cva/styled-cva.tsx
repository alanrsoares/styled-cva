/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  forwardRef,
  type CSSProperties,
  type ComponentType,
  type FC,
} from "react";

import { cva, type VariantProps } from "../cva";

import { capitalize, cn } from "../../utils";
import domElements from "../../domElements";
import {
  isTwElement,
  type AnyTailwindComponent,
  type Interpolation,
  type IntrinsicElementsKeys,
  type IntrinsicElementsTemplateFunctionsMap,
  type Nullish,
  type TailwindInterface,
} from "./types";

export const mergeArrays = (
  template: TemplateStringsArray,
  templateElements: Array<Nullish<string>>
) =>
  template.reduce<string[]>(
    (acc, c, i) => acc.concat(c || [], templateElements[i] || []), //  x || [] to remove false values e.g '', null, undefined. as Array.concat() ignores empty arrays i.e []
    []
  );

export function cleanTemplate(
  template: Array<Interpolation<any>>,
  inheritedClasses: string = ""
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
      .filter((c: string) => c !== " ") // remove empty classes
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

const templateFunctionFactory: TailwindInterface = (<
  C extends React.ElementType
>(
  Element: C
): any => {
  return (
    template: TemplateStringsArray,
    ...templateElements: ((props: any) => string | undefined | null)[]
  ) => {
    const TwComponentConstructor = (
      styleArray: (CSSProperties | ((p: any) => CSSProperties))[] = []
    ) => {
      const TwComponent = React.forwardRef(
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
                      : intStyle
                  ),
                {} as CSSProperties
              )
            : {};

          // filter out props that starts with "$" props except when styling a tailwind-styled-component
          const filteredProps = isTw(FinalElement)
            ? props
            : (Object.fromEntries(
                Object.entries(props).filter(removeTransientProps)
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
                  templateElements.map((t) => t({ ...props, $as }))
                ),
                props.className
              )}
              // forward $as prop when styling a tailwind-styled-component
              {...(isTw(Element) ? { $as } : {})}
            />
          );
        }
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
        styles: ((p: any) => CSSProperties) | CSSProperties
      ) => TwComponentConstructor(styleArray.concat(styles)) as any;

      return TwComponent;
    };
    return TwComponentConstructor();
  };
}) as any;

const intrinsicElementsMap: IntrinsicElementsTemplateFunctionsMap =
  domElements.reduce(
    <K extends IntrinsicElementsKeys>(
      acc: IntrinsicElementsTemplateFunctionsMap,
      DomElement: K
    ) => ({
      ...acc,
      [DomElement]: templateFunctionFactory(DomElement),
    }),
    {} as IntrinsicElementsTemplateFunctionsMap
  );

const tw: TailwindInterface = Object.assign(
  templateFunctionFactory,
  intrinsicElementsMap
);

export default tw;

type ElementKey = keyof TailwindInterface;

type CVA<T = unknown> = typeof cva<T>;

type StyledExtension = {
  $as?: ElementKey | ComponentType<any>;
};

export type StyledCVA = TailwindInterface & {
  [K in ElementKey]: TailwindInterface[K] & {
    cva: <T>(
      ...args: Parameters<CVA<T>>
    ) => FC<
      JSX.IntrinsicElements[K] &
        VariantProps<ReturnType<CVA<T>>> &
        StyledExtension
    >;
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
            ref?: React.Ref<HTMLElement>;
          } & StyledExtension;

          const StyledComponent = styledFn`` as FC<Props>;

          const WithRef = forwardRef<HTMLElement, Props>(
            ({ className, ...props }, ref) => (
              <StyledComponent
                className={cn(variance({ ...props, className }), className)}
                {...props}
                ref={ref}
              />
            )
          );

          WithRef.displayName = `Styled${capitalize(key)}`;

          return WithRef;
        },
      }),
    ])
  );

  return Object.assign(tw, twCVA) as StyledCVA;
}
