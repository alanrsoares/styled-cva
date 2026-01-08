import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expectType, type TypeEqual } from "ts-expect";

import { createStyledCVA } from "./styled-cva";

const tw = createStyledCVA();

describe("styled-cva", () => {
  const StyledButton = tw.button.cva("btn-base", {
    variants: {
      // variant keys starting with $ will not be sent to the DOM,
      // this avoids extraneous props warning
      $variant: {
        primary: "btn-primary",
        secondary: "btn-secondary",
      },
    },
  });

  it("should derive a union type from the variant prop", () => {
    type StyledButtonProps = ComponentProps<typeof StyledButton>;
    type VariantProp = NonNullable<StyledButtonProps["$variant"]>;

    expectType<TypeEqual<"primary" | "secondary", VariantProp>>(true);
    expectType<TypeEqual<string, VariantProp>>(false);
  });

  it("should render the button with the primary variant", () => {
    const { container } = render(
      <StyledButton $variant="primary">Click me</StyledButton>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base btn-primary"
      >
        Click me
      </button>
    `);
  });

  it("should render the button with the secondary variant", () => {
    const { container } = render(
      <StyledButton $variant="secondary">Test</StyledButton>,
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base btn-secondary"
      >
        Test
      </button>
    `);
  });

  it("should extend the component", () => {
    const ExtendedStyledButton = tw(StyledButton)`bg-green-500`;

    const { container } = render(
      <ExtendedStyledButton $variant="secondary">
        Extended
      </ExtendedStyledButton>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base btn-secondary bg-green-500"
      >
        Extended
      </button>
    `);
  });

  it("should extend the component with additional variant", () => {
    const ExtendedStyledButton = tw(StyledButton)`bg-green-500`;

    const { container } = render(
      <ExtendedStyledButton>Extended</ExtendedStyledButton>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base bg-green-500"
      >
        Extended
      </button>
    `);
  });

  it("should render a different jsx element using $as prop", () => {
    const StyledDiv = tw.div.cva("div-base", {
      variants: {
        $variant: {
          primary: "div-primary",
          secondary: "div-secondary",
        },
      },
    });

    const { container } = render(
      <StyledDiv $as="button" $variant="primary">
        I&apos;m originally a div, but I&apos;m rendered as a button
      </StyledDiv>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="div-base div-primary"
      >
        I'm originally a div, but I'm rendered as a button
      </button>
    `);
  });

  it("should render a different component using $as prop", () => {
    const StyledDiv = tw.div.cva("div-base", {
      variants: {
        $variant: {
          primary: "div-primary",
          secondary: "div-secondary",
        },
      },
    });

    const { container } = render(
      <StyledDiv $as={StyledButton} $variant="primary">
        I was once a div, but now I&apos;m a button
      </StyledDiv>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base div-base div-primary div-base div-primary"
      >
        I was once a div, but now I'm a button
      </button>
    `);
  });

  describe("withProps", () => {
    it("should apply default props to the component", () => {
      const StyledButtonWithProps = tw.button
        .cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        })
        .withProps({
          "data-some-prop": "some-value",
          $variant: "secondary",
        });

      const { container } = render(
        <StyledButtonWithProps>Click me</StyledButtonWithProps>,
      );

      expect(container.firstChild).toMatchInlineSnapshot(`
        <button
          class="btn-base btn-secondary"
          data-some-prop="some-value"
        >
          Click me
        </button>
      `);
    });

    it("should allow variant props to be overridden by user props", () => {
      const StyledButtonWithProps = tw.button
        .cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        })
        .withProps({
          $variant: "primary",
        });

      const { container } = render(
        <StyledButtonWithProps $variant="secondary">
          Click me
        </StyledButtonWithProps>,
      );

      // User prop should override default
      expect(container.firstChild).toMatchInlineSnapshot(`
        <button
          class="btn-base btn-secondary"
        >
          Click me
        </button>
      `);
    });

    it("should allow user props to override default props", () => {
      const StyledButtonWithProps = tw.button
        .cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        })
        .withProps({
          "data-testid": "default-id",
          "data-some-prop": "default-value",
        });

      const { container } = render(
        <StyledButtonWithProps $variant="primary" data-testid="user-id">
          Click me
        </StyledButtonWithProps>,
      );

      const button = container.firstChild as HTMLElement;
      expect(button.getAttribute("data-testid")).toBe("user-id");
      expect(button.getAttribute("data-some-prop")).toBe("default-value");
    });

    it("should work with multiple default props", () => {
      const StyledButtonWithProps = tw.button
        .cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
            },
          },
        })
        .withProps({
          "data-prop1": "value1",
          "data-prop2": "value2",
          type: "button" as const,
        });

      const { container } = render(
        <StyledButtonWithProps $variant="primary">
          Click me
        </StyledButtonWithProps>,
      );

      const button = container.firstChild as HTMLElement;
      expect(button.getAttribute("data-prop1")).toBe("value1");
      expect(button.getAttribute("data-prop2")).toBe("value2");
      expect(button.getAttribute("type")).toBe("button");
    });

    it("should not have withProps method on the returned component", () => {
      const StyledButtonWithProps = tw.button
        .cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
            },
          },
        })
        .withProps({
          "data-some-prop": "some-value",
        });

      // Verify that withProps is not available on the returned component
      // This is a runtime check - TypeScript will catch this at compile time
      expect("withProps" in StyledButtonWithProps).toBe(false);
    });

    it("should accept variant props in withProps", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
            secondary: "btn-secondary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that $variant IS in the allowed props
      type HasVariant = "$variant" extends keyof WithPropsParams ? true : false;
      expectType<TypeEqual<HasVariant, true>>(true);

      // Verify that variant prop values are validated (excluding undefined)
      type VariantValue = NonNullable<WithPropsParams["$variant"]>;
      expectType<TypeEqual<VariantValue, "primary" | "secondary">>(true);
    });

    it("should reject invalid variant prop values in withProps", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
            secondary: "btn-secondary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that "tertiary" is NOT a valid variant value
      type HasTertiary = "tertiary" extends WithPropsParams["$variant"]
        ? true
        : false;
      expectType<TypeEqual<HasTertiary, false>>(true);
    });

    it("should reject unknown props in withProps", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that unknown props are NOT in the allowed props
      type HasUnknownProp = "unknownProp" extends keyof WithPropsParams
        ? true
        : false;
      expectType<TypeEqual<HasUnknownProp, false>>(true);
    });

    it("should accept valid element props in withProps", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that valid button props ARE in the allowed props
      type HasType = "type" extends keyof WithPropsParams ? true : false;
      type HasDisabled = "disabled" extends keyof WithPropsParams
        ? true
        : false;
      type HasClassName = "className" extends keyof WithPropsParams
        ? true
        : false;

      expectType<TypeEqual<HasType, true>>(true);
      expectType<TypeEqual<HasDisabled, true>>(true);
      expectType<TypeEqual<HasClassName, true>>(true);
    });

    it("should accept data attributes in withProps", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that data attributes ARE in the allowed props
      type HasDataTestId = `data-testid` extends keyof WithPropsParams
        ? true
        : false;
      type HasDataCustom = `data-custom-attr` extends keyof WithPropsParams
        ? true
        : false;

      expectType<TypeEqual<HasDataTestId, true>>(true);
      expectType<TypeEqual<HasDataCustom, true>>(true);
    });

    it("should reject extraneous props at compile time", () => {
      const StyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof StyledButton.withProps>[0];

      // Verify that extraneous props are NOT in the allowed props
      type HasFasdas = "fasdas" extends keyof WithPropsParams ? true : false;
      expectType<TypeEqual<HasFasdas, false>>(true);

      // Verify that other unknown props are also excluded
      type HasUnknown = "completelyUnknownProp" extends keyof WithPropsParams
        ? true
        : false;
      expectType<TypeEqual<HasUnknown, false>>(true);
    });
  });
});
