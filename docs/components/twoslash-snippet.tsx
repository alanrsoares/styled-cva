import { processHoverDocs, twoslashCompilerOptions } from "@/lib/twoslash";
import { highlight } from "fumadocs-core/highlight";
import { transformerTwoslash } from "fumadocs-twoslash";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

type HighlightComponents = NonNullable<
  Parameters<typeof highlight>[1]["components"]
>;

// fumadocs-core types `components` as intrinsic tags only, but its renderer
// looks up any tag name, and the twoslash transformer emits these three.
const twoslashComponents = {
  Popup,
  PopupContent,
  PopupTrigger,
} as unknown as HighlightComponents;

export const TwoslashSnippet = async ({
  code,
  lang = "tsx",
}: {
  code: string;
  lang?: "ts" | "tsx";
}) =>
  highlight(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      transformerTwoslash({
        explicitTrigger: false,
        twoslashOptions: { compilerOptions: twoslashCompilerOptions },
        rendererRich: { processHoverDocs },
      }),
    ],
    components: {
      pre: (props) => (
        <CodeBlock {...props}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      ),
      ...twoslashComponents,
    },
  });
