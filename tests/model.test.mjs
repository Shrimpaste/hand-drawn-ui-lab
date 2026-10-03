import test from 'node:test';
import assert from 'node:assert/strict';
import { BoardModel, squareAt, squarePosition } from '../src/model.js';

test('board hit testing matches all square centers and rejects the outer edges', () => {
  for (let i = 0; i < 64; i++) assert.equal(squareAt(...squarePosition(i)), i);
  for (const point of [[4, 0], [0, 4], [-4.01, 0], [0, -4.01]]) assert.equal(squareAt(...point), null);
});
test('free moves preserve occupied squares and undo multiple actors in order', () => {
  const model = new BoardModel([{ id: 'a', square: 9 }, { id: 'b', square: 49 }]);
  assert.equal(model.move('a', 49), null);
  assert.equal(model.move('a', null), null);
  assert.equal(model.history.length, 0);
  model.move('a', 27); model.move('b', 28); model.move('a', 35);
  assert.deepEqual(model.undo(), { id: 'a', from: 35, to: 27 });
  model.undo(); model.undo();
  assert.equal(model.at(9).id, 'a'); assert.equal(model.at(49).id, 'b');
  assert.equal(model.undo(), null);
});
