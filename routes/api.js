'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const puzzle = req.body.puzzle;
      const coor = req.body.coordinate;
      const val = req.body.value;
      //If any of these variables are undefined we return right away with the error message
      if (!puzzle || !coor || !val) return res.json({
        error: 'Required field(s) missing'
      });
      //If there are any illegal inputs return right away with the appropriate error message
      const puzzleValidation = solver.validatePuzzle(puzzle);
      if (puzzleValidation) return res.json({
        error: puzzleValidation
      });
      const rowC = coor.split('')[0].toUpperCase();
      const colC = (coor.split('')[1] - 1).toString();
      const fieldsValidation = solver.validateFields(rowC, colC, val);
      if (fieldsValidation) return res.json({
        error: fieldsValidation
      });
      //Now we check for conflicts
      const table = solver.makeTable(puzzle);
      const conflictMap = {
        row: solver.checkRowPlacement(table, rowC, val),
        column: solver.checkColPlacement(table, colC, val),
        region: solver.checkRegionPlacement(table, rowC, colC, val)
      };

      const conflict = Object.keys(conflictMap).filter(key => !conflictMap[key]);
    
      if (!conflict.length) return res.json({ valid: true });
      res.json({
        valid: false,
        conflict
      })
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle;
      
      if (!puzzle) return res.json({
        error: 'Required field missing'
      });
    
      const validation = solver.validatePuzzle(puzzle);
      if (validation) return res.json({
        error: validation
      });
    
      const solution = solver.solve(puzzle);
      //In case solve() returns false 
      if (!solution) return res.json({
        error: 'Puzzle cannot be solved'
      });
      
      res.json({
        solution
      });      
    });
};
