import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders invite title", () => {
  render(<App />);
  expect(screen.getByText(/Sankara Batch Party/i)).toBeInTheDocument();
});
