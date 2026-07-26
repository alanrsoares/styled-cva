// src/StyledCvaSpec.res - Comprehensive spec tests for @styled-cva/rescript package

open StyledCva

module BunTest = {
  @module("bun:test") external describe: (string, unit => unit) => unit = "describe"
  @module("bun:test") external test: (string, unit => unit) => unit = "test"

  module Expect = {
    type t
    @module("bun:test") external expect: 'a => t = "expect"
    @send external toBe: (t, 'a) => unit = "toBe"
    @send external toBeDefined: t => unit = "toBeDefined"
  }
}

open BunTest
open BunTest.Expect

describe("@styled-cva/rescript Package Spec", () => {
  describe("cn utility", () => {
    test("merges conflicting tailwind class names properly", () => {
      let classes = cn(["text-red-500", "p-4", "text-blue-500"])
      expect(classes)->toBe("p-4 text-blue-500")
    })

    test("handles multiple class strings and empty entries", () => {
      let classes = cn(["font-bold", "text-center", "leading-tight"])
      expect(classes)->toBe("font-bold text-center leading-tight")
    })
  })

  describe("cva variant generator", () => {
    test("generates basic variant classes", () => {
      let buttonVariants = cva(
        "btn-base",
        {
          "variants": {
            "variant": {
              "primary": "btn-primary",
              "secondary": "btn-secondary",
            },
          },
        },
      )

      let cls = buttonVariants({"variant": "primary"})
      expect(cls)->toBe("btn-base btn-primary")
    })

    test("handles multi-axis variants and defaultVariants", () => {
      let badgeVariants = cva(
        "badge-base inline-flex items-center",
        {
          "variants": {
            "$tone": {
              "brand": "bg-brand text-brand-foreground",
              "muted": "bg-muted text-muted-foreground",
            },
            "$size": {
              "sm": "px-2 py-0.5 text-xs",
              "lg": "px-3 py-1 text-sm",
            },
          },
          "defaultVariants": {
            "$tone": "brand",
            "$size": "sm",
          },
        },
      )

      let defaultCls = badgeVariants(%raw("{}"))
      expect(defaultCls)->toBe(
        "badge-base inline-flex items-center bg-brand text-brand-foreground px-2 py-0.5 text-xs",
      )

      let customCls = badgeVariants({"$tone": "muted", "$size": "lg"})
      expect(customCls)->toBe(
        "badge-base inline-flex items-center bg-muted text-muted-foreground px-3 py-1 text-sm",
      )
    })

    test("handles compound variants", () => {
      let cardVariants = cva(
        "card-base p-4",
        {
          "variants": {
            "$active": {
              "true": "border-blue-500",
              "false": "border-gray-200",
            },
            "$size": {
              "sm": "text-sm",
              "lg": "text-lg",
            },
          },
          "compoundVariants": [
            {
              "$active": "true",
              "$size": "lg",
              "class": "shadow-xl border-2",
            },
          ],
        },
      )

      let compoundCls = cardVariants({"$active": "true", "$size": "lg"})
      expect(compoundCls)->toBe(
        "card-base p-4 border-blue-500 text-lg shadow-xl border-2",
      )
    })
  })

  describe("Tw element factory exports", () => {
    test("exports element factory components for standard HTML tags", () => {
      expect(Tw.div)->toBeDefined
      expect(Tw.button)->toBeDefined
      expect(Tw.span)->toBeDefined
      expect(Tw.a)->toBeDefined
      expect(Tw.p)->toBeDefined
      expect(Tw.section)->toBeDefined
      expect(Tw.header)->toBeDefined
      expect(Tw.footer)->toBeDefined
      expect(Tw.h1)->toBeDefined
      expect(Tw.h2)->toBeDefined
    })
  })

  describe("JSX usage", () => {
    module Card = {
      let make = Tw.div("rounded-md p-4 shadow-xs")
    }

    module Link = {
      let make = Tw.a("underline")
    }

    module Badge = {
      type props = {...styledProps, @as("$tone") tone?: string}

      let make: React.component<props> = Tw.spanWithConfig(
        "badge-base",
        {
          "variants": {
            "$tone": {
              "brand": "bg-brand",
              "muted": "bg-muted",
            },
          },
        },
      )
    }

    test("factory results are usable directly as JSX components", () => {
      let element =
        <Card className="mt-2" id="card">
          <Link href="https://rescript-lang.org" target="_blank" rel="noopener noreferrer">
            {React.string("ReScript")}
          </Link>
          <Badge tone="muted"> {React.string("new")} </Badge>
        </Card>

      expect(element)->toBeDefined
    })
  })
})
