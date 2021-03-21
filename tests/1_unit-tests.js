const chai = require('chai');
const assert = chai.assert;

const SudokuSolver = require('../controllers/sudoku-solver.js');
const solver = new SudokuSolver();
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const testString = puzzlesAndSolutions[0][0];
const testTable = solver.makeTable(testString);
const testSolution = puzzlesAndSolutions[0][1];

suite('UnitTests', () => {
  suite('solver.validate()', () => {
    test('Handle a valid string', (done) => {
      assert.equal(solver.validatePuzzle(testString), false);
      done();
    });

    test('Handle invalid characters', (done) => {
      assert.equal(solver.validatePuzzle('x'.repeat(81)), 'Invalid characters in puzzle');
      done();
    });
    
    test('Handle a string too short or too long', (done) => {
      assert.equal(solver.validatePuzzle('.9..1.'), 'Expected puzzle to be 81 characters long');
      assert.equal(solver.validatePuzzle(testString+'...'), 'Expected puzzle to be 81 characters long');
      done();
    });
  }); //end suite solver.validate()

  suite('solver.checkRowPlacement()', () => {
    test('Valid row placement', (done) => {
      assert.equal(solver.checkRowPlacement(testTable, 'A', '9'), true, '9 in A');
      assert.equal(solver.checkRowPlacement(testTable, 'D', '6'), true, '6 in D');
      assert.equal(solver.checkRowPlacement(testTable, 'H', '7'), true, '7 in H');
      done();
    });

    test('Invalid row placement', (done) => {
      assert.equal(solver.checkRowPlacement(testTable, 'B', '6'), false, '6 in B');
      assert.equal(solver.checkRowPlacement(testTable, 'C', '2'), false, '2 in C');
      assert.equal(solver.checkRowPlacement(testTable, 'I', '3'), false, '3 in I');
      done();
    });
  }); //end suite solver.checkRowPlacement()

  suite('solver.checkColPlacement()', () => {
    test('Valid col placement', (done) => {
      assert.equal(solver.checkColPlacement(testTable, '0', '9'), true, '9 in 1');
      assert.equal(solver.checkColPlacement(testTable, '6', '6'), true, '6 in 7');
      assert.equal(solver.checkColPlacement(testTable, '7', '5'), true, '5 in 8');
      done();
    });

    test('Invalid col placement', (done) => {
      assert.equal(solver.checkColPlacement(testTable, '1', '6'), false, '6 in 2');
      assert.equal(solver.checkColPlacement(testTable, '2', '2'), false, '2 in 3');
      assert.equal(solver.checkColPlacement(testTable, '8', '7'), false, '7 in 9');
      done();
    });
  }); //end suite solver.checkColPlacement()

  suite('solver.checkRegionPlacement()', () => {
    test('Valid region placement', (done) => {
      assert.equal(solver.checkRegionPlacement(testTable, 'B', '0', '9'), true, 'region 1');
      assert.equal(solver.checkRegionPlacement(testTable, 'E', '7', '5'), true, 'region 6');
      assert.equal(solver.checkRegionPlacement(testTable, 'I', '4', '3'), true, 'region 8');
      done();
    });

    test('Invalid region placement', (done) => {
      assert.equal(solver.checkRegionPlacement(testTable, 'A', '3', '3'), false, 'region 2');
      assert.equal(solver.checkRegionPlacement(testTable, 'H', '6', '9'), false, 'region 9');
      assert.equal(solver.checkRegionPlacement(testTable, 'F', '4', '6'), false, 'region 5');
      done();
    });
  }); //end suite solver.checkRegionPlacement()
  
  suite('solver.solve()', () => {
    test('Valid string passes the solver', (done) => {
      puzzlesAndSolutions.forEach(([puzzle, solution]) => {
        assert.isOk(solver.solve(puzzle));
      });
      done();
    });
    
    test('Invalid string fails the solver', (done) => {
      assert.isFalse(solver.solve('..9..5.1.85.4....243222....1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'));
      done();
    });
    
    test('Solver returns the correct solution', (done) => {
      puzzlesAndSolutions.forEach(([puzzle, solution]) => {
        assert.equal(solver.solve(puzzle), solution);
      });
      done();
    });    
  });
});
