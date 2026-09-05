import { highlight } from "fumadocs-core/highlight";
import { transformerTwoslash } from "fumadocs-twoslash";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { processHoverDocs, twoslashCompilerOptions } from "@/lib/twoslash";

export async function TwoslashSnippet({
  code,
  lang = "tsx",
}: {
  code: string;
  lang?: "ts" | "tsx";
}) {
  return highlight(code, {
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
      Popup,
      PopupContent,
      PopupTrigger,
    },
  });
}
