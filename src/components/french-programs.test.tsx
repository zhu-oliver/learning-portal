import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FrenchPrograms } from "./french-programs";

const gradeOptions = Array.from({ length: 8 }, (_, index) => ({ grade: index + 1, core: index === 3 ? 12 : 0, immersion: index === 1 ? 10 : 0 }));

describe("French program selector", () => {
  it("switches all grade links, counts, and availability while preserving shared practice", async () => {
    const user = userEvent.setup();
    render(<FrenchPrograms gradeOptions={gradeOptions} />);
    expect(screen.getByRole("radio", { name: "Core French / English-stream students" })).toBeChecked();
    expect(screen.getByRole("link", { name: /Grade 4 12 Core French lessons/ })).toHaveAttribute("href", "/learn/french/grade-4");
    await user.click(screen.getByRole("radio", { name: "French Immersion students" }));
    expect(screen.getByRole("heading", { name: "French Immersion — choose your grade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Grade 2 10 French Immersion lessons/ })).toHaveAttribute("href", "/learn/french/immersion-grade-2");
    expect(screen.getByRole("link", { name: /Grade 4 No lessons published/ })).toHaveAttribute("href", "/learn/french/immersion-grade-4");
    expect(screen.getByRole("link", { name: /All-grades vocabulary practice/ })).toHaveAttribute("href", "/learn/french/practice");
    await user.click(screen.getByRole("radio", { name: "Core French / English-stream students" }));
    expect(screen.getByRole("link", { name: /Grade 4 12 Core French lessons/ })).toHaveAttribute("href", "/learn/french/grade-4");
  });

  it("returns to the selected immersion program from immersion catalog links", () => {
    render(<FrenchPrograms initialProgram="immersion" gradeOptions={gradeOptions} />);
    expect(screen.getByRole("radio", { name: "French Immersion students" })).toBeChecked();
  });
});
