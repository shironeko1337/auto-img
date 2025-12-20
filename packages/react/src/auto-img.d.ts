declare namespace JSX {
  interface IntrinsicElements {
    "auto-img": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        // Core attributes
        src?: string;
        width?: string;
        height?: string;

        // Image attributes (prefixed)
        "img-alt"?: string;
        "img-loading"?: "lazy" | "eager";
        "img-title"?: string;
        "img-draggable"?: boolean | "true" | "false";
        "img-crossOrigin"?: "anonymous" | "use-credentials" | "";
        "img-decoding"?: "async" | "sync" | "auto";
        "img-fetchPriority"?: "high" | "low" | "auto";

        // Model attributes
        focus?: string;
        "focus-center"?: string;
        "focus.tl"?: string;
        "focus.tl.x"?: string;
        "focus.tl.y"?: string;
        "focus.br"?: string;
        "focus.br.x"?: string;
        "focus.br.y"?: string;
        defer?: boolean | "true" | "false";
        allowDistortion?: boolean | "true" | "false";
        padding?: string;
        placeholder?: string;
      },
      HTMLElement
    >;
  }
}

export {};
