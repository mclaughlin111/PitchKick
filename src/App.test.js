import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("tone", () => ({
  Transport: {
    bpm: { value: 120 },
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
  context: {
    state: "suspended",
    on: jest.fn(),
    off: jest.fn(),
  },
  start: jest.fn(() => Promise.resolve()),
}));

test("renders synth controls", () => {
  render(<App />);
  expect(screen.getByText(/pitch-seq/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
});
