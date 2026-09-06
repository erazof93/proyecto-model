import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input", () => {
  it("renders with a placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders a label and associates it via htmlFor/id", () => {
    render(<Input id="username" label="Usuario" />);
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
  });

  it("accepts typed input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here") as HTMLInputElement;

    await user.type(input, "test value");
    expect(input.value).toBe("test value");
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Test" />);

    await user.type(screen.getByPlaceholderText("Test"), "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows an error message and applies the danger border", () => {
    render(<Input placeholder="Email" error="Campo requerido" />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toHaveClass("border-danger");
  });
});
