import { describe, it, expect } from "vitest";
import { parsePdb, residueSS, bondsByDistance, applyBiomt } from "../src/engine3d/pdb.js";

const MINI = [
  "HELIX    1 AA1 ALA A    2  LEU A    4  1                                   3    ",
  "SHEET    1 AA1 2 GLY A   6  VAL A   7  0                                        ",
  "REMARK 350   BIOMT1   1  1.000000  0.000000  0.000000        0.00000            ",
  "REMARK 350   BIOMT2   1  0.000000  1.000000  0.000000        0.00000            ",
  "REMARK 350   BIOMT3   1  0.000000  0.000000  1.000000        0.00000            ",
  "REMARK 350   BIOMT1   2 -1.000000  0.000000  0.000000       10.00000            ",
  "REMARK 350   BIOMT2   2  0.000000 -1.000000  0.000000        0.00000            ",
  "REMARK 350   BIOMT3   2  0.000000  0.000000  1.000000        0.00000            ",
  "ATOM      1  N   ALA A   2      11.104   6.134  -6.504  1.00 20.00           N  ",
  "ATOM      2  CA  ALA A   2      11.639   6.071  -5.147  1.00 21.50           C  ",
  "ATOM      3  C   ALA A   2      10.560   5.700  -4.150  1.00 22.00           C  ",
  "ATOM      4  CA  LEU A   3      12.000   9.000  -1.000  1.00 30.00           C  ",
  "ATOM      5  CA  LEU A   4      13.000  12.000   1.000  1.00 31.00           C  ",
  "ATOM      6  CA  ALA A   5      14.000  15.000   3.000  1.00 32.00           C  ",
  "ATOM      7  CA  GLY A   6      15.000  18.000   5.000  1.00 33.00           C  ",
  "ATOM      8  CA  VAL A   7      16.000  21.000   7.000  1.00 34.00           C  ",
  "HETATM    9 MG    MG A 401       1.000   2.000   3.000  1.00 12.00          MG  ",
  "HETATM   10  O   HOH A 500       5.000   5.000   5.000  1.00 12.00           O  ",
  "END",
].join("\n");

describe("PDB parsing", () => {
  const pdb = parsePdb(MINI);
  it("reads fixed-column atoms with element, residue and B-factor", () => {
    const ca = pdb.atoms.find((a) => a.name === "CA" && a.resSeq === 2);
    expect(ca).toMatchObject({ chain: "A", resName: "ALA", x: 11.639, y: 6.071, z: -5.147, b: 21.5, element: "C" });
    expect(pdb.atoms.length).toBe(8);
  });
  it("keeps hetero atoms apart and skips water", () => {
    expect(pdb.hetero.map((h) => h.resName)).toEqual(["MG"]);
    expect(pdb.hetero[0]).toMatchObject({ element: "MG", x: 1, y: 2, z: 3 });
  });
  it("assigns helix, strand and coil from the HELIX/SHEET ranges", () => {
    expect([2, 3, 4, 5, 6, 7].map((n) => residueSS(pdb, "A", n))).toEqual(["H", "H", "H", "C", "E", "E"]);
  });
  it("reads biological assembly operators", () => {
    expect(pdb.biomt.length).toBe(2);
    const moved = applyBiomt(pdb.biomt[1], [1, 2, 3]);
    expect(moved).toEqual([9, -2, 3]);
  });
});

describe("distance bonds", () => {
  it("links covalent neighbours and ignores far atoms", () => {
    const atoms = [
      { element: "C", x: 0, y: 0, z: 0 },
      { element: "O", x: 1.25, y: 0, z: 0 },
      { element: "P", x: 3.4, y: 0, z: 0 },
      { element: "C", x: 0, y: 4, z: 0 },
    ];
    expect(bondsByDistance(atoms)).toEqual([[0, 1]]);
    atoms[2].x = 2.7;
    expect(bondsByDistance(atoms)).toEqual([[0, 1], [1, 2]]);
  });
});


