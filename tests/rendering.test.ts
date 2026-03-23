import { describe, it, expect } from "vitest";
import { renderName } from "../src/rendering/renderer.js";
import type { NamePart } from "../src/domain/types.js";

const parts: NamePart[] = [
  { type: "given", value: "Molly", position: 0 },
  { type: "surname", value: "Bennett", position: 1 },
];

describe("renderName", () => {
  it("renders given + surname in displayOrder [0,1]", () => {
    expect(renderName(parts, [0, 1])).toBe("Molly Bennett");
  });

  it("renders surname-first with displayOrder [1,0]", () => {
    expect(renderName(parts, [1, 0])).toBe("Bennett Molly");
  });

  it("renders a single-part name", () => {
    const single: NamePart[] = [{ type: "single", value: "Isambard", position: 0 }];
    expect(renderName(single, [0])).toBe("Isambard");
  });

  it("throws when displayOrder references a missing position", () => {
    expect(() => renderName(parts, [0, 99])).toThrow();
  });
});
