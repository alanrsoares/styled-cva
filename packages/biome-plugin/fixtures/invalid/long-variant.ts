const Rail = tw(Sidebar, "group absolute inset-y-0", {
  variants: {
    $expanded: {
      true: "w-(--rail-width) [&_[data-slot=sidebar-group-label]]:px-4 [&_[data-slot=sidebar-group-label]]:delay-300 [&_[data-sidebar=menu-button]>span:last-child]:animate-in",
      false: "w-(--sidebar-width-icon)",
    },
  },
});
