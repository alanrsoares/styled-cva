import type { ClassValue as CLSXClassValue } from "clsx";

export type ClassPropKey = "class" | "className";

export type ClassValue = CLSXClassValue;

export type ClassProp =
  | {
    class: ClassValue;
    className?: never;
  }
  | { class?: never; className: ClassValue }
  | { class?: never; className?: never };

export type OmitUndefined<T> = T extends undefined ? never : T;
export type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;
