import { describe, it, expect } from "vitest";
import { contactSkeleton } from "../src/scenes/structure/contacts.js";

// A toy lysine-like side chain CA-CB-CG-CD-NZ plus an unrelated tail atom, and a second residue far away.
const atoms = [
  { n: "CA", e: "C", num: 1, p: [0, 0, 0] },
  { n: "CB", e: "C", num: 1, p: [1.5, 0, 0] },
  { n: "CG", e: "C", num: 1, p: [3, 0, 0] },
  { n: "CD", e: "C", num: 1, p: [4.5, 0, 0] },
  { n: "NZ", e: "N", num: 1, p: [6, 0, 0] },
  { n: "CA", e: "C", num: 2, p: [0, 20, 0] },
  { n: "OG", e: "O", num: 2, p: [0, 21.5, 0] },
];
const bonds = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6]];

describe("contactSkeleton", () => {
  it("keeps only the path from CA to the atom that touches the partner", () => {
    const { keep, contact } = contactSkeleton(atoms, bonds, [[7.5, 0, 0]], 3.3);
    expect([...contact]).toEqual([4]);
    expect([...keep].sort()).toEqual([0, 1, 2, 3, 4]);
  });
  it("drops residues that touch nothing", () => {
    const { keep } = contactSkeleton(atoms, bonds, [[7.5, 0, 0]], 3.3);
    expect(keep.has(5)).toBe(false);
    expect(keep.has(6)).toBe(false);
  });
  it("cuts a long side chain short when only a middle atom is in contact", () => {
    const { keep } = contactSkeleton(atoms, bonds, [[3, 2.5, 0]], 3.3);
    expect(keep.has(4)).toBe(false);
  });
});
