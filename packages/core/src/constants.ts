/**
 * Host attributes that are comon to native elements and auto-img elements.
 */
export const CommonHostAttrs = [
  "focus",
  "focusCenter",
  "focus.tl",
  "focus.tl.x",
  "focus.tl.y",
  "focus.br",
  "focus.br.x",
  "focus.br.y",

  "defer",
  "allowDistortion",
  "padding",
  // placeholder should belong to model, however, since rendering can't be controlled
  // for native element, it's only effective for auto-img elements.
  "placeholder",
];
