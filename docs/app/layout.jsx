import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

import '../styles/globals.css'

export const metadata = {
  title: 'styled-cva',
  description: 'A typesafe, class-variance-authority-based, styled-components-like library for authoring React components',
}

const banner = <Banner storageKey="styled-cva-banner">styled-cva 0.5.0 is available 🎉</Banner>
const navbar = (
  <Navbar
    logo={<b>styled-cva</b>}
    projectLink="https://github.com/alanrsoares/styled-cva"
    docsRepositoryBase="https://github.com/alanrsoares/styled-cva/tree/main/docs"
  />
)
const footer = <Footer>Apache-2.0 {new Date().getFullYear()} © styled-cva.</Footer>

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" type="image/svg+xml" href="/styled-cva.svg" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/alanrsoares/styled-cva/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
