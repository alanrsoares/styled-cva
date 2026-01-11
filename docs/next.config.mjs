import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // Nextra-specific options can be added here
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // Add regular Next.js options here if needed
  // Turbopack requires this alias to resolve next-mdx-import-source-file
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.js",
    },
  },
});
