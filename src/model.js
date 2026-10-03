export function squareAt(x, y) {
  if (x < -4 || x >= 4 || y < -4 || y >= 4) return null;
  return Math.floor(x + 4) + Math.floor(y + 4) * 8;
}
export function squarePosition(square) {
  return [(square % 8) - 3.5, Math.floor(square / 8) - 3.5];
}
export class BoardModel {
  constructor(pieces) { this.pieces = pieces; this.history = []; }
  at(square) { return this.pieces.find(p => p.square === square) || null; }
  move(id, target) {
    const piece = this.pieces.find(p => p.id === id);
    if (!piece || !Number.isInteger(target) || target < 0 || target > 63 || this.at(target)) return null;
    const change = { id, from: piece.square, to: target };
    this.history.push(change); piece.square = target;
    return change;
  }
  undo() {
    const change = this.history.pop();
    if (!change) return null;
    this.pieces.find(p => p.id === change.id).square = change.from;
    return { id: change.id, from: change.to, to: change.from };
  }
}
