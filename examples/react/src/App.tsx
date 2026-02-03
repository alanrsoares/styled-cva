import tw from "@styled-cva/react";
import { useState } from "react";

import viteLogo from "/vite.svg";

import reactLogo from "./assets/react.svg";

const Root = tw.div`flex flex-col items-center gap-6 max-w-[1280px] mx-auto p-8 text-center w-full`;
const LogoRow = tw.div`flex flex-wrap justify-center gap-4`;
const LogoLink = tw.a`inline-flex p-6 font-medium text-[#646cff] no-underline hover:text-[#535bf2] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]`;
const ReactLogoLink = tw.a`inline-flex p-6 font-medium text-[#646cff] no-underline hover:text-[#535bf2] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]`;
const LogoImg = tw.img`h-24 w-auto will-change-[filter]`;
const ReactLogoImg = tw.img`h-24 w-auto will-change-[filter] motion-safe:animate-[spin_20s_linear_infinite]`;
const Title = tw.h1`text-4xl font-semibold leading-tight m-0`;
const Card = tw.div`p-8`;
const CardText = tw.p`m-0`;
const CardCode = tw.code`bg-[#1a1a1a] rounded px-1.5 py-0.5 font-mono text-sm`;
const ReadTheDocs = tw.p`text-[#888] m-0`;

const CountButton = tw.button.cva(
  "rounded-lg border border-transparent px-5 py-2.5 text-base font-medium font-sans bg-[#1a1a1a] cursor-pointer transition-[border-color] duration-200 hover:border-[#646cff] focus:outline-4 focus:outline-[#646cff]",
  {
    variants: {
      $highlight: {
        true: "border-2 border-[#646cff]",
        false: "",
      },
    },
    defaultVariants: {
      $highlight: false,
    },
  },
);

function App() {
  const [count, setCount] = useState(0);

  return (
    <Root>
      <LogoRow>
        <LogoLink href="https://vite.dev" target="_blank">
          <LogoImg src={viteLogo} alt="Vite logo" />
        </LogoLink>
        <ReactLogoLink href="https://react.dev" target="_blank">
          <ReactLogoImg src={reactLogo} alt="React logo" />
        </ReactLogoLink>
      </LogoRow>
      <Title>Vite + React</Title>
      <Card>
        <CountButton
          onClick={() => setCount((count) => count + 1)}
          $highlight={count > 0}
        >
          count is {count}
        </CountButton>
        <CardText>
          Edit <CardCode>src/App.tsx</CardCode> and save to test HMR
        </CardText>
      </Card>
      <ReadTheDocs>Click on the Vite and React logos to learn more</ReadTheDocs>
    </Root>
  );
}

export default App;
