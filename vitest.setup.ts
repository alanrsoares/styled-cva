/* eslint-disable @typescript-eslint/no-namespace */

import matchers, {
  type TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

declare global {
  namespace Vi {
    // @ts-expect-error - Jest's expect method is extended with react-testing-library's matchers
    interface JestAssertion<T = unknown>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);
