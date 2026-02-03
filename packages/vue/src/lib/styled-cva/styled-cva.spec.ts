/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref, type DefineComponent } from "vue";
import { expectType, type TypeEqual } from "ts-expect";
import { vi } from "vitest";

import { createStyledCVA } from "./styled-cva";

const tw = createStyledCVA();

// Helper to get component props type
type ComponentProps<T extends DefineComponent<any>> = T extends DefineComponent<infer P>
  ? P
  : never;

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
    const { container } = render(StyledButton, {
      props: { $variant: "primary" },
      slots: { default: "Click me" },
    });

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base btn-primary"
      >
        Click me
      </button>
    `);
  });

  it("should render the button with the secondary variant", () => {
    const { container } = render(StyledButton, {
      props: { $variant: "secondary" },
      slots: { default: "Test" },
    });
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

    const { container } = render(ExtendedStyledButton, {
      props: { $variant: "secondary" },
      slots: { default: "Extended" },
    });

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

    const { container } = render(ExtendedStyledButton, {
      slots: { default: "Extended" },
    });

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn-base bg-green-500"
      >
        Extended
      </button>
    `);
  });

  it("should style a custom component with class prop", () => {
    const MyButton = defineComponent({
      props: {
        class: { type: String, default: "" },
      },
      setup(props, { slots }) {
        return () => h("button", { class: props.class }, slots.default?.());
      },
    });

    const StyledMyButton = tw(MyButton as any)`text-red-500`;

    const { container } = render(StyledMyButton, {
      slots: { default: "Hello" },
    });

    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="text-red-500"
      >
        Hello
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

    const { container } = render(StyledDiv, {
      props: { $as: "button", $variant: "primary" },
      slots: { default: "I'm originally a div, but I'm rendered as a button" },
    });

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

    const { container } = render(StyledDiv, {
      props: { $as: StyledButton, $variant: "primary" },
      slots: { default: "I was once a div, but now I'm a button" },
    });

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

      const { container } = render(StyledButtonWithProps, {
        slots: { default: "Click me" },
      });

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

      const { container } = render(StyledButtonWithProps, {
        props: { $variant: "secondary" },
        slots: { default: "Click me" },
      });

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

      const { container } = render(StyledButtonWithProps, {
        props: { $variant: "primary", "data-testid": "user-id" },
        slots: { default: "Click me" },
      });

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

      const { container } = render(StyledButtonWithProps, {
        props: { $variant: "primary" },
        slots: { default: "Click me" },
      });

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
      expect("withProps" in StyledButtonWithProps).toBe(false);
    });

    it("should accept variant props in withProps", () => {
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
            secondary: "btn-secondary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

      // Verify that $variant IS in the allowed props
      type HasVariant = "$variant" extends keyof WithPropsParams ? true : false;
      expectType<TypeEqual<HasVariant, true>>(true);

      // Verify that variant prop values are validated (excluding undefined)
      type VariantValue = NonNullable<WithPropsParams["$variant"]>;
      expectType<TypeEqual<VariantValue, "primary" | "secondary">>(true);
    });

    it("should reject invalid variant prop values in withProps", () => {
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
            secondary: "btn-secondary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

      // Verify that "tertiary" is NOT a valid variant value
      type HasTertiary = "tertiary" extends WithPropsParams["$variant"]
        ? true
        : false;
      expectType<TypeEqual<HasTertiary, false>>(true);
    });

    it("should reject unknown props in withProps", () => {
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

      // Verify that unknown props are NOT in the allowed props
      type HasUnknownProp = "unknownProp" extends keyof WithPropsParams
        ? true
        : false;
      expectType<TypeEqual<HasUnknownProp, false>>(true);
    });

    it("should accept valid element props in withProps", () => {
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

      // Verify that valid button props ARE in the allowed props
      type HasType = "type" extends keyof WithPropsParams ? true : false;
      type HasDisabled = "disabled" extends keyof WithPropsParams
        ? true
        : false;
      type HasClass = "class" extends keyof WithPropsParams ? true : false;

      expectType<TypeEqual<HasType, true>>(true);
      expectType<TypeEqual<HasDisabled, true>>(true);
      expectType<TypeEqual<HasClass, true>>(true);
    });

    it("should accept data attributes in withProps", () => {
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

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
      const TestStyledButton = tw.button.cva("btn-base", {
        variants: {
          $variant: {
            primary: "btn-primary",
          },
        },
      });

      type WithPropsParams = Parameters<typeof TestStyledButton.withProps>[0];

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

  describe("User Interactions and Business Logic", () => {
    describe("Event Handlers", () => {
      it("should handle click events", async () => {
        const handleClick = vi.fn();
        const SubmitButton = tw.button.cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            return () =>
              h(
                SubmitButton,
                { $variant: "primary", onClick: handleClick },
                () => "Submit",
              );
          },
        });

        render(TestComponent);

        const button = screen.getByRole("button", { name: /submit/i });
        await userEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("should handle form submission", async () => {
        const handleSubmit = vi.fn((e: Event) => e.preventDefault());
        const SubmitButton = tw.button.cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            return () =>
              h("form", { onSubmit: handleSubmit }, [
                h(
                  SubmitButton,
                  { $variant: "primary", type: "submit" },
                  () => "Submit Form",
                ),
              ]);
          },
        });

        render(TestComponent);

        const button = screen.getByRole("button", { name: /submit form/i });
        await userEvent.click(button);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });

      it("should handle keyboard events", async () => {
        const handleKeyDown = vi.fn();
        const Input = tw.input.cva("input-base", {
          variants: {
            $variant: {
              default: "input-default",
              error: "input-error",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            return () =>
              h(Input, {
                $variant: "default",
                onKeydown: handleKeyDown,
                placeholder: "Type here",
              });
          },
        });

        render(TestComponent);

        const input = screen.getByPlaceholderText(/type here/i);
        await userEvent.type(input, "test{Enter}");

        expect(handleKeyDown).toHaveBeenCalled();
      });
    });

    describe("State-Driven Styling", () => {
      it("should apply loading state styles", () => {
        const Button = tw.button.cva("btn-base", {
          variants: {
            $loading: {
              true: "btn-loading opacity-50 cursor-not-allowed",
              false: "btn-normal",
            },
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        });

        const { container, unmount } = render(Button, {
          props: { $variant: "primary", $loading: false },
          slots: { default: "Click me" },
        });

        expect(container.firstChild).toHaveClass("btn-normal");
        unmount();

        const { container: container2 } = render(Button, {
          props: { $variant: "primary", $loading: true },
          slots: { default: "Loading..." },
        });

        expect(container2.firstChild).toHaveClass(
          "btn-loading",
          "opacity-50",
          "cursor-not-allowed",
        );
      });

      it("should apply error state styles", () => {
        const Input = tw.input.cva("input-base", {
          variants: {
            $error: {
              true: "input-error border-red-500",
              false: "input-normal border-gray-300",
            },
          },
        });

        const { container, unmount } = render(Input, {
          props: { $error: false, placeholder: "Email" },
        });

        expect(container.firstChild).toHaveClass("input-normal");
        unmount();

        const { container: container2 } = render(Input, {
          props: { $error: true, placeholder: "Email" },
        });

        expect(container2.firstChild).toHaveClass(
          "input-error",
          "border-red-500",
        );
      });

      it("should apply success state styles", () => {
        const Alert = tw.div.cva("alert-base", {
          variants: {
            $status: {
              success: "alert-success bg-green-100 text-green-800",
              error: "alert-error bg-red-100 text-red-800",
              info: "alert-info bg-blue-100 text-blue-800",
            },
          },
        });

        const { container } = render(Alert, {
          props: { $status: "success" },
          slots: { default: "Operation completed successfully" },
        });

        expect(container.firstChild).toHaveClass(
          "alert-success",
          "bg-green-100",
          "text-green-800",
        );
      });

      it("should apply disabled state styles", () => {
        const Button = tw.button.cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        });

        const { container } = render(Button, {
          props: { $variant: "primary", disabled: true },
          slots: { default: "Disabled Button" },
        });

        const button = container.firstChild as HTMLButtonElement;
        expect(button).toBeDisabled();
        expect(button).toHaveClass("btn-base", "btn-primary");
      });

      it("should prevent interaction when disabled", async () => {
        const handleClick = vi.fn();
        const Button = tw.button.cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            return () =>
              h(
                Button,
                { $variant: "primary", disabled: true, onClick: handleClick },
                () => "Disabled",
              );
          },
        });

        render(TestComponent);

        const button = screen.getByRole("button", { name: /disabled/i });
        await userEvent.click(button);

        expect(handleClick).not.toHaveBeenCalled();
      });
    });

    describe("Form Validation", () => {
      it("should show validation error state", () => {
        const Input = tw.input.cva("input-base", {
          variants: {
            $hasError: {
              true: "border-red-500 focus:ring-red-500",
              false: "border-gray-300 focus:ring-blue-500",
            },
            $touched: {
              true: "",
              false: "",
            },
          },
          compoundVariants: [
            {
              $hasError: true,
              $touched: true,
              class: "ring-2 ring-red-500",
            },
          ],
        });

        const { container } = render(Input, {
          props: {
            $hasError: true,
            $touched: true,
            placeholder: "Email",
            "aria-invalid": "true",
          },
        });

        const input = container.firstChild as HTMLInputElement;
        expect(input).toHaveClass("border-red-500", "ring-2", "ring-red-500");
        expect(input).toHaveAttribute("aria-invalid", "true");
      });

      it("should show validation success state", () => {
        const Input = tw.input.cva("input-base", {
          variants: {
            $isValid: {
              true: "border-green-500",
              false: "border-gray-300",
            },
          },
        });

        const { container } = render(Input, {
          props: { $isValid: true, placeholder: "Email" },
        });

        expect(container.firstChild).toHaveClass("border-green-500");
      });
    });

    describe("Conditional Rendering", () => {
      it("should conditionally render based on props", () => {
        const Alert = tw.div.cva("alert-base", {
          variants: {
            $show: {
              true: "block",
              false: "hidden",
            },
            $variant: {
              info: "bg-blue-100",
              warning: "bg-yellow-100",
            },
          },
        });

        const { container, unmount } = render(Alert, {
          props: { $show: false, $variant: "info" },
          slots: { default: "Hidden message" },
        });

        expect(container.firstChild).toHaveClass("hidden");
        unmount();

        const { container: container2 } = render(Alert, {
          props: { $show: true, $variant: "info" },
          slots: { default: "Visible message" },
        });

        expect(container2.firstChild).toHaveClass("block");
      });

      it("should change variant based on business logic", () => {
        const StatusBadge = tw.span.cva("badge-base", {
          variants: {
            $status: {
              active: "bg-green-500 text-white",
              inactive: "bg-gray-500 text-white",
              pending: "bg-yellow-500 text-white",
            },
          },
        });

        // Simulate business logic: determine status from data
        const getStatus = (isActive: boolean, isPending: boolean) => {
          if (isPending) return "pending" as const;
          return isActive ? ("active" as const) : ("inactive" as const);
        };

        const { container, unmount } = render(StatusBadge, {
          props: { $status: getStatus(true, false) },
          slots: { default: "User" },
        });

        expect(container.firstChild).toHaveClass("bg-green-500");
        unmount();

        const { container: container2, unmount: unmount2 } = render(
          StatusBadge,
          {
            props: { $status: getStatus(false, false) },
            slots: { default: "User" },
          },
        );

        expect(container2.firstChild).toHaveClass("bg-gray-500");
        unmount2();

        const { container: container3 } = render(StatusBadge, {
          props: { $status: getStatus(false, true) },
          slots: { default: "User" },
        });

        expect(container3.firstChild).toHaveClass("bg-yellow-500");
      });
    });

    describe("Vue Reactivity Integration", () => {
      it("should work with ref for interactive components", async () => {
        const ToggleButton = tw.button.cva("btn-base", {
          variants: {
            $isActive: {
              true: "bg-blue-500 text-white",
              false: "bg-gray-200 text-gray-800",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            const isActive = ref(false);

            return () =>
              h(
                ToggleButton,
                {
                  $isActive: isActive.value,
                  onClick: () => (isActive.value = !isActive.value),
                },
                () => (isActive.value ? "Active" : "Inactive"),
              );
          },
        });

        render(TestComponent);

        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-gray-200");
        expect(button).toHaveTextContent("Inactive");

        await userEvent.click(button);

        expect(button).toHaveClass("bg-blue-500");
        expect(button).toHaveTextContent("Active");
      });

      it("should work with form state management", async () => {
        const Input = tw.input.cva("input-base", {
          variants: {
            $hasError: {
              true: "border-red-500",
              false: "border-gray-300",
            },
          },
        });

        const SubmitButton = tw.button.cva("btn-base", {
          variants: {
            $isLoading: {
              true: "opacity-50 cursor-not-allowed",
              false: "",
            },
          },
        });

        const FormComponent = defineComponent({
          setup() {
            const error = ref(false);
            const isLoading = ref(false);

            return () =>
              h("div", [
                h(Input, { $hasError: error.value, placeholder: "Email" }),
                h(
                  SubmitButton,
                  { $isLoading: isLoading.value },
                  () => (isLoading.value ? "Submitting..." : "Submit"),
                ),
                h(
                  "button",
                  {
                    "data-testid": "trigger-error",
                    onClick: () => (error.value = true),
                  },
                  "Trigger Error",
                ),
                h(
                  "button",
                  {
                    "data-testid": "trigger-loading",
                    onClick: () => (isLoading.value = true),
                  },
                  "Trigger Loading",
                ),
              ]);
          },
        });

        render(FormComponent);

        const input = screen.getByPlaceholderText(/email/i);
        const submitButton = screen.getByRole("button", { name: /submit/i });

        // Initial state
        expect(input).toHaveClass("border-gray-300");

        // Test error state
        await userEvent.click(screen.getByTestId("trigger-error"));
        expect(input).toHaveClass("border-red-500");

        // Test loading state
        await userEvent.click(screen.getByTestId("trigger-loading"));
        expect(submitButton).toHaveClass("opacity-50");
        expect(submitButton).toHaveTextContent("Submitting...");
      });

      it("should handle multiple state changes", async () => {
        const Card = tw.div.cva("card-base", {
          variants: {
            $isSelected: {
              true: "ring-2 ring-blue-500",
              false: "",
            },
            $isHovered: {
              true: "shadow-lg",
              false: "shadow-md",
            },
            $isDisabled: {
              true: "opacity-50 pointer-events-none",
              false: "",
            },
          },
        });

        const TestComponent = defineComponent({
          setup() {
            const isSelected = ref(false);
            const isHovered = ref(false);
            const isDisabled = ref(false);

            return () =>
              h(
                Card,
                {
                  $isSelected: isSelected.value,
                  $isHovered: isHovered.value,
                  $isDisabled: isDisabled.value,
                  onClick: () =>
                    !isDisabled.value &&
                    (isSelected.value = !isSelected.value),
                  onMouseenter: () =>
                    !isDisabled.value && (isHovered.value = true),
                  onMouseleave: () => (isHovered.value = false),
                },
                () => "Card Content",
              );
          },
        });

        const { container } = render(TestComponent);
        const card = container.firstChild as HTMLElement;

        // Initial state
        expect(card).toHaveClass("shadow-md");
        expect(card).not.toHaveClass("ring-2");

        // Simulate hover
        await userEvent.hover(card);
        await waitFor(() => {
          expect(card).toHaveClass("shadow-lg");
        });

        // Simulate click
        await userEvent.click(card);
        await waitFor(() => {
          expect(card).toHaveClass("ring-2", "ring-blue-500");
        });
      });
    });

    describe("Accessibility", () => {
      it("should maintain accessibility attributes", () => {
        const Button = tw.button.cva("btn-base", {
          variants: {
            $variant: {
              primary: "btn-primary",
              secondary: "btn-secondary",
            },
          },
        });

        const { container } = render(Button, {
          props: {
            $variant: "primary",
            "aria-label": "Submit form",
            "aria-pressed": "false",
          },
          slots: { default: "Submit" },
        });

        const button = container.firstChild as HTMLButtonElement;
        expect(button).toHaveAttribute("aria-label", "Submit form");
        expect(button).toHaveAttribute("aria-pressed", "false");
      });

      it("should handle aria-invalid for form validation", () => {
        const Input = tw.input.cva("input-base", {
          variants: {
            $hasError: {
              true: "border-red-500",
              false: "border-gray-300",
            },
          },
        });

        const { container, unmount } = render(Input, {
          props: { $hasError: false, "aria-invalid": "false" },
        });

        expect(container.firstChild).toHaveAttribute("aria-invalid", "false");
        unmount();

        const { container: container2 } = render(Input, {
          props: { $hasError: true, "aria-invalid": "true" },
        });

        expect(container2.firstChild).toHaveAttribute("aria-invalid", "true");
        expect(container2.firstChild).toHaveClass("border-red-500");
      });
    });

    describe("Real-World Component Patterns", () => {
      it("should handle a toggle component with state", async () => {
        const Toggle = tw.button.cva("toggle-base", {
          variants: {
            $isOn: {
              true: "bg-blue-500",
              false: "bg-gray-300",
            },
          },
        });

        const ToggleComponent = defineComponent({
          setup() {
            const isOn = ref(false);

            return () =>
              h(
                Toggle,
                {
                  $isOn: isOn.value,
                  onClick: () => (isOn.value = !isOn.value),
                  "aria-pressed": isOn.value,
                  role: "switch",
                },
                () => (isOn.value ? "ON" : "OFF"),
              );
          },
        });

        render(ToggleComponent);

        const toggle = screen.getByRole("switch");
        expect(toggle).toHaveClass("bg-gray-300");
        expect(toggle).toHaveTextContent("OFF");
        expect(toggle).toHaveAttribute("aria-pressed", "false");

        await userEvent.click(toggle);

        expect(toggle).toHaveClass("bg-blue-500");
        expect(toggle).toHaveTextContent("ON");
        expect(toggle).toHaveAttribute("aria-pressed", "true");
      });
    });
  });
});
