import { domElements as domElementsList } from "@styled-cva/core";
import type { JSX } from "react";

export type ElementKey = keyof JSX.IntrinsicElements;

const domElements = domElementsList as unknown as ElementKey[];

export default domElements;
