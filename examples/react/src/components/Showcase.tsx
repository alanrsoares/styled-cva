import tw, { cn } from "@styled-cva/react";
import { useState } from "react";

// --- Basic styled components (tagged template) ---
const Main = tw.main`flex flex-col gap-8 w-full`;
const Section = tw.section`flex flex-col gap-4 p-6 rounded-xl bg-[#1a1a1a] border border-[#333]`;
const SectionTitle = tw.h2`text-lg font-semibold m-0 text-white`;
const SectionDesc = tw.p`text-sm text-[#888] m-0`;
const Row = tw.div`flex flex-wrap items-center gap-3`;
const Code = tw.code`text-xs bg-[#0d0d0d] text-[#a5d6ff] px-2 py-1 rounded font-mono`;
const Label = tw.span`text-sm text-[#888]`;
const WithStyleBadge = tw.span`text-[10px] uppercase text-[#888]`.withStyle({
  letterSpacing: "0.12em",
});

// --- CVA: Button with $variant and $size (intrinsic shorthand uses same config) ---
const buttonBase =
  "font-medium rounded-lg border border-transparent cursor-pointer transition-colors focus:outline-2 focus:outline-[#646cff] focus:outline-offset-2";

const buttonCvaConfig = {
  variants: {
    $variant: {
      primary: "bg-[#646cff] text-white hover:bg-[#535bf2] border-[#646cff]",
      secondary: "bg-[#333] text-white hover:bg-[#444] border-[#444]",
      ghost:
        "bg-transparent text-[#888] hover:bg-[#222] hover:text-white border-transparent",
    },
    $size: {
      sm: "text-sm px-3 py-1.5",
      md: "text-base px-4 py-2",
      lg: "text-lg px-5 py-2.5",
    },
  },
  defaultVariants: {
    $variant: "primary",
    $size: "md",
  } as const,
  compoundVariants: [
    {
      $variant: "primary",
      $size: "lg",
      class:
        "ring-2 ring-[#646cff]/60 ring-offset-2 ring-offset-[#1a1a1a]",
    } as const,
  ],
};

const Button = tw.button.cva(buttonBase, buttonCvaConfig);
const ShorthandButton = tw.button(buttonBase, buttonCvaConfig);
const CustomButton = tw(Button)`text-red-400`;

// --- withProps: pre-configured buttons (default variant + type) ---
const PrimaryButton = Button.withProps({
  type: "button",
  $variant: "primary",
  $size: "md",
});
const SecondaryButton = Button.withProps({
  type: "button",
  $variant: "secondary",
  $size: "md",
});

// --- Polymorphic: same Button, render as <a> via $as ---
const Link = tw.a`font-medium text-[#646cff] no-underline hover:text-[#535bf2] hover:underline`;

type Variant = "primary" | "secondary" | "ghost";

export default function Showcase() {
  const [selectedVariant, setSelectedVariant] = useState<Variant>("primary");

  return (
    <Main>
      {/* 1. Basic: tagged template */}
      <Section>
        <SectionTitle>1. Basic styled components</SectionTitle>
        <SectionDesc>
          Use <Code>tw.element`classes`</Code> for simple styled elements. Same
          API as styled-components.
        </SectionDesc>
        <Row>
          <SectionTitle className="text-base!">
            This section is built with
          </SectionTitle>
          <Code>tw.section`...`</Code>
          <Code>tw.h2`...`</Code>
          <Code>tw.p`...`</Code>
        </Row>
        <Row>
          <Label>withStyle:</Label>
          <WithStyleBadge>template span + .withStyle()</WithStyleBadge>
        </Row>
      </Section>

      {/* 2. CVA: variants + size */}
      <Section>
        <SectionTitle>2. CVA variants</SectionTitle>
        <SectionDesc>
          <Code>
            {"tw.button.cva(base, { variants: { $variant, $size } })"}
          </Code>{" "}
          or shorthand{" "}
          <Code>{"tw.button(base, { variants: { … } })"}</Code>. Use{" "}
          <Code>$</Code> prefix so props aren't forwarded to the DOM.
        </SectionDesc>
        <Row>
          <Label>Variant:</Label>
          <Button
            type="button"
            $variant="primary"
            $size="md"
            onClick={() => setSelectedVariant("primary")}
          >
            Primary
          </Button>
          <Button
            type="button"
            $variant="secondary"
            $size="md"
            onClick={() => setSelectedVariant("secondary")}
          >
            Secondary
          </Button>
          <Button
            type="button"
            $variant="ghost"
            $size="md"
            onClick={() => setSelectedVariant("ghost")}
          >
            Ghost
          </Button>
        </Row>
        <Row>
          <Label>Size:</Label>
          <Button type="button" $variant={selectedVariant} $size="sm">
            Small
          </Button>
          <Button type="button" $variant={selectedVariant} $size="md">
            Medium
          </Button>
          <Button type="button" $variant={selectedVariant} $size="lg">
            Large
          </Button>
        </Row>
        <Row>
          <Label>compoundVariants:</Label>
          <Button type="button" $variant="primary" $size="lg">
            primary + lg → ring
          </Button>
        </Row>
        <Row>
          <Label>Intrinsic shorthand:</Label>
          <ShorthandButton type="button" $variant="ghost" $size="sm">
            tw.button(base, config)
          </ShorthandButton>
        </Row>
      </Section>

      {/* 3. withProps */}
      <Section>
        <SectionTitle>3. withProps</SectionTitle>
        <SectionDesc>
          <Code>{".withProps({ type: 'button', $variant: 'primary' })"}</Code> —
          lock in default props so callers don't repeat them.
        </SectionDesc>
        <Row>
          <PrimaryButton>Primary (defaults)</PrimaryButton>
          <SecondaryButton>Secondary (defaults)</SecondaryButton>
        </Row>
      </Section>

      {/* 4. Polymorphic $as */}
      <Section>
        <SectionTitle>4. Polymorphic $as</SectionTitle>
        <SectionDesc>
          Same Button component, render as <Code>&lt;a&gt;</Code> with{" "}
          <Code>$as="a"</Code> and <Code>href</Code>.
        </SectionDesc>
        <Row>
          <Button
            $as="a"
            href="https://github.com/alanrsoares/styled-cva"
            target="_blank"
            rel="noreferrer"
            $variant="primary"
            $size="md"
          >
            Button as link →
          </Button>
        </Row>
      </Section>

      {/* 5. Extend CVA component */}
      <Section>
        <SectionTitle>5. Extend CVA — tw(Button)</SectionTitle>
        <SectionDesc>
          <Code>{`tw(Button)\`extra classes\``}</Code> — wrap an existing CVA
          component (Solid/Vue same pattern).
        </SectionDesc>
        <Row>
          <CustomButton $variant="primary" $size="md">
            Extended (red label)
          </CustomButton>
          <CustomButton $variant="secondary" $size="sm">
            Small secondary
          </CustomButton>
        </Row>
      </Section>

      {/* 6. Utilities */}
      <Section>
        <SectionTitle>6. Utilities — cn()</SectionTitle>
        <SectionDesc>
          Re-exports from <Code>@styled-cva/react</Code> include{" "}
          <Code>cn</Code>, <Code>cva</Code>, <Code>isTaggedTemplateArg</Code>.
        </SectionDesc>
        <Row>
          <Label>cn():</Label>
          <span
            className={cn(
              "rounded px-2 py-1 text-xs",
              "bg-[#333] text-[#a5d6ff]",
            )}
          >
            clsx + tailwind-merge
          </span>
        </Row>
      </Section>

      {/* Footer */}
      <Section>
        <SectionTitle>Learn more</SectionTitle>
        <SectionDesc>
          <Link
            href="https://github.com/alanrsoares/styled-cva"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          {" · "}
          <Link
            href="https://www.npmjs.com/package/@styled-cva/react"
            target="_blank"
            rel="noreferrer"
          >
            npm @styled-cva/react
          </Link>
        </SectionDesc>
      </Section>
    </Main>
  );
}
