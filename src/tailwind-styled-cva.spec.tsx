import { render } from "@testing-library/react";
import tw from "./";

describe("tailwind-styled-cva", () => {
  const StyledButton = tw.button.cva("bg-red-500", {
    variants: {
      $variant: {
        primary: "bg-red-500",
        secondary: "bg-blue-500",
      },
    },
  });

  expect(StyledButton).toBeDefined();

  it("should render the button with the primary variant", () => {
    const { container } = render(
      <StyledButton $variant="primary">Test</StyledButton>
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="bg-red-500"
      >
        Test
      </button>
    `);
  });

  it("should render the button with the secondary variant", () => {
    const { container } = render(
      <StyledButton $variant="secondary">Test</StyledButton>
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="bg-blue-500"
      >
        Test
      </button>
    `);
  });

  it("should extend the component", () => {
    const ExtendedStyledButton = tw(StyledButton)`bg-green-500`;

    const { container } = render(
      <ExtendedStyledButton>Extended</ExtendedStyledButton>
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="bg-green-500"
      >
        Extended
      </button>
    `);
  });

  it("should render a different component using $as prop", () => {
    const StyledDiv = tw.div.cva("bg-red-500", {
      variants: {
        $variant: {
          primary: "bg-red-500",
          secondary: "bg-blue-500",
        },
      },
    });

    const { container } = render(
      <StyledDiv $as={StyledButton} $variant="primary">
        Test
      </StyledDiv>
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="bg-red-500"
      >
        Test
      </button>
    `);
  });
});
