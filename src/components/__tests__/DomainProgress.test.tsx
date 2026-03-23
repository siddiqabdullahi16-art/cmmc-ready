import React from "react";
import { render, screen } from "@testing-library/react";
import { DomainProgress } from "../DomainProgress";

describe("DomainProgress", () => {
  const defaultProps = {
    domainId: "AC",
    name: "Access Control",
    met: 8,
    total: 10,
    notMet: 1,
    partial: 1,
  };

  it("renders domain name", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("Access Control")).toBeInTheDocument();
  });

  it("renders domain id", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("shows correct met count", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("8 met")).toBeInTheDocument();
  });

  it("shows correct gaps count", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("1 gaps")).toBeInTheDocument();
  });

  it("shows correct partial count", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("1 partial")).toBeInTheDocument();
  });

  it("shows correct percentage", () => {
    render(<DomainProgress {...defaultProps} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("hides met label when met is 0", () => {
    render(<DomainProgress {...defaultProps} met={0} />);
    expect(screen.queryByText(/met/)).not.toBeInTheDocument();
  });

  it("hides gaps label when notMet is 0", () => {
    render(<DomainProgress {...defaultProps} notMet={0} />);
    expect(screen.queryByText(/gaps/)).not.toBeInTheDocument();
  });

  it("shows 0% when total is 0", () => {
    render(
      <DomainProgress
        domainId="AC"
        name="Access Control"
        met={0}
        total={0}
        notMet={0}
        partial={0}
      />
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
