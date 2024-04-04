export const capitalize = ([fst, ...str]: string) =>
  fst?.toUpperCase() + str.join("");
