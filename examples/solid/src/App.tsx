import tw from "@styled-cva/solid";

import viteLogo from "/vite.svg";

import solidLogo from "./assets/solid.svg";
import Showcase from "./components/Showcase";

const Root = tw.div`flex flex-col items-center gap-8 max-w-[900px] mx-auto p-8 w-full`;
const Header = tw.header`flex flex-col items-center gap-4 text-center`;
const LogoRow = tw.div`flex flex-wrap justify-center gap-4`;
const LogoLink = tw.a`inline-flex p-4 font-medium text-[#646cff] no-underline hover:text-[#535bf2] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]`;
const SolidLogoLink = tw.a`inline-flex p-4 font-medium text-[#646cff] no-underline hover:text-[#535bf2] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#2c4f7caa]`;
const LogoImg = tw.img`h-16 w-auto will-change-[filter]`;
const SolidLogoImg = tw.img`h-16 w-auto will-change-[filter]`;
const Title = tw.h1`text-3xl font-semibold text-[#646cff] m-0`;
const Subtitle = tw.p`text-[#888] m-0 text-sm`;

export default function App() {
  return (
    <Root>
      <Header>
        <LogoRow>
          <LogoLink href="https://vite.dev" target="_blank">
            <LogoImg src={viteLogo} alt="Vite" />
          </LogoLink>
          <SolidLogoLink href="https://solidjs.com" target="_blank">
            <SolidLogoImg src={solidLogo} alt="Solid" />
          </SolidLogoLink>
        </LogoRow>
        <Title>styled-cva + Solid</Title>
        <Subtitle>
          Type-safe, CVA-based styled components for Solid with Tailwind
        </Subtitle>
      </Header>
      <Showcase />
    </Root>
  );
}
