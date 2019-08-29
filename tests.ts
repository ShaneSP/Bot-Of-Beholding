let main = require('./src/main.ts');
let assert = require('assert');

describe('!roll', () => {
  /**
   * Tests for roll() helper function to ensure valid results are returned.
   */
  describe('roll()', () => {
    // Math.ceil ensures at least 1 roll
    let rolls = Math.ceil(Math.random() * 10);
    let sides = Math.ceil(Math.random() * 10);
    it('rolls are valid, dice with ' + sides + ' sides only yields up to ' + sides, () => {
        main.roll(rolls, sides).forEach((e) => {
            assert(e <= sides && e > 0);
        });
    });
    it('more than zero rolls', () => {
      assert(main.roll(rolls, sides).length > 0);
    });
    it('zero rolls argument yields zero rolls', () => {
      assert(main.roll(0, sides).length == 0);
    })
  });
});