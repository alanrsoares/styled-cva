import { render } from "@testing-library/react";
import tw from ".";

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

  expect(StyledButton).toBeDefined();

  it("should render the button with the primary variant", () => {
    const { container } = render(
      <StyledButton $variant="primary">Click me</StyledButton>
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
      <StyledButton $variant="secondary">Test</StyledButton>
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
      <ExtendedStyledButton>Extended</ExtendedStyledButton>
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
      </StyledDiv>
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
      </StyledDiv>
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base div-base div-primary div-base div-primary"
      >
        I was once a div, but now I'm a button
      </button>
    `);
  });
});
