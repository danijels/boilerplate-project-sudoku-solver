class SudokuSolver {
  
  validatePuzzle(puzzleString) {
    if (puzzleString.length !== 81) return 'Expected puzzle to be 81 characters long'; 
    if (!/^[1-9.]+$/.test(puzzleString)) return 'Invalid characters in puzzle';   

    return false;
  }
  validateFields(rowC, colC, value) {
    if (!/^[1-9]{1}$/.test(value)) return 'Invalid value';
    if (!/^[A-I]{1}$/.test(rowC) || !/^[0-8]{1}$/.test(colC)) return 'Invalid coordinate'; 
    
    return false;    
  }
  makeTable(puzzleString) {
    let values = puzzleString;
    const puzzleTable = new Map();
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    
    for (let row of rows) {
      const rowArray = values.slice(0, 9).split('');
      puzzleTable.set(row, rowArray);
      values = values.slice(9);
    }
    return puzzleTable;
  }
  //The row should be provided in the format of a letter A-I
  checkRowPlacement(table, row, value) {
    const theRow = table.get(row);

    return !theRow.includes(value);
  }
  //The column should be provided in the format of a number 0-9
  checkColPlacement(table, column, value) {
    const col = [];
    const i = Number(column);

    for (let val of table.values()) {
      col.push(val[i]);
    }
    
    return !col.includes(value);
  }

  checkRegionPlacement(table, row, column, value) {    
    const regionRowsTable = new Map();
    regionRowsTable.set('ABC', [table.get('A'), table.get('B'), table.get('C')]);
    regionRowsTable.set('DEF', [table.get('D'), table.get('E'), table.get('F')]);
    regionRowsTable.set('GHI', [table.get('G'), table.get('H'), table.get('I')]);

    let rows;    
    for (let [key, value] of regionRowsTable) {
      if (key.includes(row)) rows = value;
    }
    
    let rowsAndCols;
    if ('012'.includes(column)) rowsAndCols = rows.map(r => r.slice(0, 3)).flat();
    if ('345'.includes(column)) rowsAndCols = rows.map(r => r.slice(3, 6)).flat();
    if ('678'.includes(column)) rowsAndCols = rows.map(r => r.slice(6, 9)).flat();
    
    return (!rowsAndCols.includes(value));    
  }

  solve(puzzleString) {
    debugger;
    const board = this.makeTable(puzzleString);
    //This part transforms the sudoku table in a way that each dot is replaced 
    //with the correct coordinate of that cell (A0 - I8)
    //A map of all empty cells is also created
    const cellsTable = new Map();
    const incompleteCells = [];

    for (let [key, value] of board) {    
      const colPositions = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
      const incompleteRow = [];
      const transformed = value.map((cell, i) => {
        if (cell === '.') {
          const coordinate = key+colPositions[i];
          incompleteRow.push(coordinate);
          return coordinate;
        }
        else return cell;
      });    
      cellsTable.set(key, transformed);
      incompleteCells.push(incompleteRow);
    }
    //Everything is ready for our backtracking solving algorithm
    const result = this.backtrackingSolver(cellsTable, incompleteCells.flat());
    if (!result) return result;
    
    const final = [];
    for (let [key, row] of result) {
      final.push(...row)
    }
    return final.join('');
  }
  
  backtrackingSolver(board, incomplete) {
    //Only if the entire board is successfully solved the final state of the 
    //board is returned and it zoomes up to the top to the very first invocation
    //in this case it is the return statement in the solver()
    if (!incomplete.length) return board;

    const cell = incomplete[0];
    const row = cell[0];
    const col = cell[1];
    
    for (let i = 1; i <= 9; i++) {
      const val = String(i);
      const valid = this.checkRowPlacement(board, row, val)
      && this.checkColPlacement(board, col, val)
      && this.checkRegionPlacement(board, row, col, val);
      //If there is no conflict, if at THAT TIME a value is a legal choice for 
      //that cell, the cell gets assigned to that value and we take a leap of 
      //faith, update the board and go straight onto solving the next cell
      if (valid) {
        const newBoard = this.update(board, row, col, val);
        const success = this.backtrackingSolver(newBoard, incomplete.slice(1));
        //In case we solved the board and the last call detected an empty array
        //of unsolved cells and therefore returned the final board to us 
        //the value of success is going to be a Map and therefore a truthy and 
        //this block is going to keep returning it until it reaches the first
        //invocation
        if (success) return success;
        //We're here in case of some future call returning false
        //We then try to continue the loop where we left off and try the next value
        //For that cell and see if that works out for the entire board
        if (!success) continue;
      }
      //If it's invalid we're here and we try the next value
    }
    //If no value from 1-9 can be a valid choice for a cell it means the board 
    //has an incorrect value set for one of the cells updated in the previous
    //calls. So we return false, continue the loop and try the next value for the 
    //previous cell. 
    //If nothing works out for the board, the sudoku is invalid or unsolvable and
    //the final return value passed to the initial caller is false
    return false;
  }
  
  update(sudoku, key, i, value) {
    const newMap = new Map(sudoku);
    // const updated = newMap.get(key) mutates the initial board!!!!!!!!
    const updated = [...newMap.get(key)];
    updated.splice(i, 1, value);

    newMap.set(key, updated);
    return newMap;
  }
}

module.exports = SudokuSolver;

