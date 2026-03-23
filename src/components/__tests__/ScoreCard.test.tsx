import React from "react";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "../ScoreCard";

describe("ScoreCard", () => {
  it("renders title and value", () => {
    render(<ScoreCard title="Total Score" value="85%" color="success" />);
    expect(screen.getByText("Total Score")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("applies success color class", () => {
    render(<ScoreCard title="Score" value="90%" color="success" />);
    const valueEl = screen.getByText("90%");
    expect(valueEl.className).toContain("text-emerald-400");
  });

  it("applies warning color class", () => {
    render(<ScoreCard title="Score" value="60%" color="warning" />);
    const valueEl = screen.getByText("60%");
    expect(valueEl.className).toContain("text-amber-400");
  });

  it("applies danger color class", () => {
    render(<ScoreCard title="Score" value="20%" color="danger" />);
    const valueEl = screen.getByText("20%");
    expect(valueEl.className).toContain("text-red-400");
  });
});
