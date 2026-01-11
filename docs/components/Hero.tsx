import type { ReactNode } from "react";

export function Hero(): ReactNode {
  return (
    <div className="mb-12 border-b border-[var(--nextra-border-color)] pb-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight text-[var(--nextra-text-color)]">
          styled-cva
        </h1>
        <p className="mb-8 text-xl leading-relaxed text-[var(--nextra-text-color-60)]">
          A{" "}
          <strong className="font-semibold text-[var(--nextra-text-color)]">
            typesafe
          </strong>
          ,{" "}
          <strong className="font-semibold text-[var(--nextra-text-color)]">
            class-variance-authority-based
          </strong>
          ,{" "}
          <strong className="font-semibold text-[var(--nextra-text-color)]">
            styled-components-like
          </strong>{" "}
          library for authoring React components
        </p>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <a
            href="/getting-started"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nextra-border-color)] bg-[var(--nextra-bg-color)] px-4 py-2 text-sm font-medium text-[var(--nextra-text-color)] no-underline transition-colors hover:bg-[var(--nextra-bg-color-secondary)] hover:text-[var(--nextra-text-color)]"
          >
            Get Started
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://github.com/alanrsoares/styled-cva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nextra-border-color)] bg-[var(--nextra-bg-color)] px-4 py-2 text-sm font-medium text-[var(--nextra-text-color)] no-underline transition-colors hover:bg-[var(--nextra-bg-color-secondary)] hover:text-[var(--nextra-text-color)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--nextra-border-color)] bg-[var(--nextra-bg-color)]">
          <div className="border-b border-[var(--nextra-border-color)] bg-[var(--nextra-bg-color-secondary)] px-4 py-2.5">
            <div className="text-xs font-medium text-[var(--nextra-text-color-60)]">
              Quick example
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <pre className="m-0 text-sm leading-relaxed">
              <code className="text-[var(--nextra-text-color)]">{`import tw from "styled-cva";

const Button = tw.button.cva("px-4 py-2 rounded", {
  variants: {
    $variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
  },
});

<Button $variant="primary">Click me</Button>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
