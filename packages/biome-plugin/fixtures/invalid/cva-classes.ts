const Btn = tw.button.cva({
  base: "inline-flex   items-center     gap-2 ",
  variants: {
    size: { sm: "h-8   px-3", "2xl": "  h-14  px-8" },
  },
  compoundVariants: [{ size: "sm", class: "gap-1   px-2" }],
  defaultVariants: { size: "sm" },
});
