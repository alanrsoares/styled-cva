import type { StyledCVA } from "./lib/styled-cva/styled-cva";

type Assert<T extends true> = T;

/** Compile-time check: `tw.button` carries `.cva` (see `StyledCVA`). */
declare const tw: StyledCVA;
type BtnFromDot = typeof tw.button;
type _ = Assert<BtnFromDot extends { cva: unknown } ? true : false>;
