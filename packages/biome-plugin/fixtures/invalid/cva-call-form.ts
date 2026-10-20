const Tag = tw.div("flex   gap-2", {
  variants: { size: { sm: "h-8   px-3" } },
});
const Wrapped = tw(Card, "rounded   border", {
  variants: { size: { sm: "h-8   px-3" } },
});
const WrappedCva = tw(Card).cva("rounded   border", {
  variants: { size: { sm: "h-8   px-3" } },
});
