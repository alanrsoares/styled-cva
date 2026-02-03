import type { JSX } from "solid-js";

import { domElements as domElementsList } from "@styled-cva/core";

export type ElementKey = keyof JSX.IntrinsicElements;

const domElements = domElementsList as unknown as ElementKey[];

export default domElements;
