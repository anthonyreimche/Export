// Under an export's result, each photo that failed for a known reason is named
// with that reason, so the user learns why, not only how many. Ported from
// core's ExportFailureList.test.tsx.

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ExportFailureList } from "../src/ExportFailureList";
import { React, initRuntime } from "../src/rt";
import { cls } from "../src/styles";
import { fakeApi } from "./support/fake-api";

beforeEach(() => initRuntime(fakeApi().api));
afterEach(cleanup);

describe("the failures listed under an export's result", () => {
  it("name each photo with why it failed", () => {
    render(
      <ExportFailureList
        failures={[
          { filename: "a.RAF", reason: "The original isn't available." },
          { filename: "b.NEF", reason: "The original can't be read." },
        ]}
      />,
    );

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "a.RAF: The original isn't available.",
      "b.NEF: The original can't be read.",
    ]);
  });

  it("name the first ten, and say how many more there are", () => {
    const failures = Array.from({ length: 12 }, (_, i) => ({
      filename: `p${i}.RAF`,
      reason: "The original isn't available.",
    }));

    render(<ExportFailureList failures={failures} />);

    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items).toHaveLength(11);
    expect(items[9]).toBe("p9.RAF: The original isn't available.");
    expect(items[10]).toBe("and 2 more.");
  });

  it("show nothing when no failure has a reason", () => {
    const { container } = render(<ExportFailureList failures={undefined} />);

    expect(container.querySelector("ul")).toBeNull();
  });

  it("truncate a long line, with the whole of it in the tooltip", () => {
    render(<ExportFailureList failures={[{ filename: "a.RAF", reason: "The original isn't available." }]} />);

    const item = screen.getByRole("listitem");
    expect(item.className).toBe(cls.failure);
    expect(item.title).toBe("a.RAF: The original isn't available.");
  });
});
