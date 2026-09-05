import { ArrowRight, Code2, Layers, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { CodeTabs } from "@/components/code-tabs";
import { TwoslashSnippet } from "@/components/twoslash-snippet";
import { gitConfig } from "@/lib/shared";

const features = [
  {
    icon: Zap,
    title: "Type-Safe CVA Variants",
    body: "First-class TypeScript inference for variant props, default variants, and compound variants without boilerplate.",
  },
  {
    icon: Code2,
    title: "Intrinsic CVA Shorthand",
    body: "Author components directly with tw.button(base, config) — clean, concise, and familiar styled syntax.",
  },
  {
    icon: Layers,
    title: "Multi-Framework & Polymorphic",
    body: "Available for React, Solid, Vue, and ReScript. Polymorphic $as prop support to easily swap elements or custom components.",
  },
  {
    icon: Sparkles,
    title: "Dedicated Tooling",
    body: "Official ESLint, Prettier, and Biome plugins to enforce clean Tailwind class strings and auto-extract styled components.",
  },
];

const buttonSnippet = `import tw from "@styled-cva/react";

// Intrinsic CVA shorthand with typed variant inference
export const Button = tw.button(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      $variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      },
      $size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      $variant: "primary",
      $size: "md",
    },
  },
);

// Full autocompletion on $variant and $size props:
export const App = () => (
  <Button $variant="primary" $size="md">
    Click me
  </Button>
);
`;

const polymorphicSnippet = `import Link from "next/link";
import tw from "@styled-cva/react";

export const ActionButton = tw.button(
  "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium",
  {
    variants: {
      $variant: {
        primary: "bg-blue-600 text-white",
        ghost: "bg-transparent text-slate-700",
      },
    },
  },
);

// $as swaps the element or custom component while keeping variant typings
export const Navigation = () => (
  <nav className="flex gap-2">
    <ActionButton $as="a" href="https://github.com/alanrsoares/styled-cva">
      GitHub
    </ActionButton>
    <ActionButton $as={Link} href="/docs" $variant="primary">
      Documentation
    </ActionButton>
  </nav>
);
`;

const templateSnippet = `import tw from "@styled-cva/react";

// Tagged template syntax with Tailwind CSS utilities
export const Card = tw.div\`
  rounded-xl border border-slate-200 bg-white p-6 shadow-sm
  transition-shadow hover:shadow-md
\`;

export const CardTitle = tw.h3\`
  text-lg font-semibold text-slate-900
\`;

export const CardDescription = tw.p\`
  mt-1 text-sm text-slate-500
\`;
`;

const examples = [
  { id: "button", filename: "Button.tsx", code: buttonSnippet },
  { id: "polymorphic", filename: "Polymorphic.tsx", code: polymorphicSnippet },
  { id: "card", filename: "Card.tsx", code: templateSnippet },
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4">
      {/* hero */}
      <section className="flex w-full max-w-5xl flex-col items-center pt-20 pb-16 text-center sm:pt-28">
        <span className="mb-5 rounded-full border border-fd-border bg-fd-secondary/60 px-3 py-1 text-xs font-medium tracking-wide text-fd-muted-foreground">
          type-safe · class-variance-authority · tailwind-css
        </span>
        <h1 className="bg-gradient-to-b from-fd-foreground to-fd-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          styled-cva
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-fd-muted-foreground sm:text-xl">
          A typesafe, class-variance-authority-based, styled-components-like
          library for authoring React, Solid, Vue, and ReScript components.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
          >
            Documentation
          </Link>
          <a
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* code sample with Shiki + Twoslash */}
      <section className="w-full max-w-3xl pb-20 text-left">
        <CodeTabs
          tabs={examples.map(({ id, filename }) => ({ label: id, filename }))}
        >
          {examples.map(({ id, code }) => (
            <TwoslashSnippet key={id} code={code} lang="tsx" />
          ))}
        </CodeTabs>
      </section>

      {/* features */}
      <section className="grid w-full max-w-5xl gap-4 pb-24 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40"
          >
            <div className="mb-3 inline-flex rounded-lg bg-fd-primary/10 p-2 text-fd-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mb-1.5 font-semibold">{title}</h2>
            <p className="text-sm text-fd-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
