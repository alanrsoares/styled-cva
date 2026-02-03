<script setup lang="ts">
import tw from '@styled-cva/vue'
import Showcase from './components/Showcase.vue'

const Root = tw.div`flex flex-col items-center gap-8 max-w-[900px] mx-auto p-8 w-full`
const Header = tw.header`flex flex-col items-center gap-4 text-center`
const LogoRow = tw.div`flex flex-wrap justify-center gap-4`
const LogoLink = tw.a`inline-flex p-4 font-medium text-[#646cff] no-underline hover:text-[#535bf2] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]`
const LogoImg = tw.img`h-16 w-auto will-change-[filter]`
const Title = tw.h1`text-3xl font-semibold text-[#646cff] m-0`
const Subtitle = tw.p`text-[#888] m-0 text-sm`
</script>

<template>
  <Root>
    <Header>
      <LogoRow>
        <LogoLink href="https://github.com/alanrsoares/styled-cva" target="_blank">
          <LogoImg src="/styled-cva.svg" alt="styled-cva" />
        </LogoLink>
      </LogoRow>
      <Title>styled-cva + Vue</Title>
      <Subtitle>Type-safe, CVA-based styled components for Vue with Tailwind</Subtitle>
    </Header>
    <Showcase />
  </Root>
</template>
