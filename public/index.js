const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("error");
const cells = [...document.getElementsByClassName("field")];

document.addEventListener("DOMContentLoaded", () => {
  textArea.value =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  fillpuzzle(textArea.value);
});

textArea.addEventListener("input", () => {
  fillpuzzle(textArea.value);
});

cells.forEach(cell => cell.addEventListener("input", (e) => {
  const val = Number(e.target.value);

  if ((val <= 9 && val >= 1) || e.target.value == '') {
    const coordinate = e.target.className.split(' ')[0];
    coordInput.value = coordinate;
    valInput.value = val ? val : '.';    
    placeValue()
  } else {
    cell.value = '';
    coordInput.value = '';
    valInput.value = '';
  }
}));

async function randomPuzzle() {
  const res = await fetch('./public/puzzles.json');
  let puzzles = await res.json();
  puzzles = puzzles.puzzles;

  textArea.value = puzzles[Math.floor(Math.random() * (puzzles.length))];
  textArea.dispatchEvent(new Event('input', { bubbles: true }));
}

function fillpuzzle(data) {
  let len = data.length < 81 ? data.length : 81;
  for (let i = 0; i < len; i++) {
    let rowLetter = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 9));
    let col = (i % 9) + 1; 
    if (!data[i] || data[i] === ".") {
      document.getElementsByClassName(rowLetter + col)[0].value = " ";
      continue;
    }
    document.getElementsByClassName(rowLetter + col)[0].value = data[i];
  }
  return;
}

async function getSolved() {
  const stuff = { "puzzle": textArea.value }
  errorMsg.innerText = "Please wait, this might take me some time..."
  const data = await fetch("/api/solve", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify(stuff)
  })
  const parsed = await data.json();
  if (parsed.error) {
    errorMsg.innerHTML = parsed.error;
    return
  }
  let msg = "You got it right!"
  if (textArea.value !== parsed.solution) msg = "Oops, you didn't get this one!";

  errorMsg.innerText = msg;
  textArea.value = parsed.solution;
  textArea.dispatchEvent(new Event('input', { bubbles: true }))
}

let lastCells = [];

const styleCell = (cell) => {
  const lastCell = {
    cell,
    initColor: cell.style.backgroundColor
  };
  lastCells.push(lastCell);
  cell.style.backgroundColor = 'rgba(253, 2, 6, 0.5)';
}

async function getChecked() {
  if (lastCells.length) {
    for (let lastCell of lastCells) {
      lastCell.cell.style.backgroundColor = lastCell.initColor;
    }
    lastCells = [];
  }
  const stuff = {"puzzle": textArea.value, "coordinate": coordInput.value, "value": valInput.value}
    const data = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify(stuff)
  })
  const parsed = await data.json();
  if (parsed.error) errorMsg.innerHTML = parsed.error;
  else {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const regions = [
      ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
      ['D1', 'D2', 'D3', 'E1', 'E2', 'E3', 'F1', 'F2', 'F3'],
      ['G1', 'G2', 'G3', 'H1', 'H2', 'H3', 'I1', 'I2', 'I3'],
      ['A4', 'A5', 'A6', 'B4', 'B5', 'B6', 'C4', 'C5', 'C6'],
      ['D4', 'D5', 'D6', 'E4', 'E5', 'E6', 'F4', 'F5', 'F6'],
      ['G4', 'G5', 'G6', 'H4', 'H5', 'H6', 'I4', 'I5', 'I6'],
      ['A7', 'A8', 'A9', 'B7', 'B8', 'B9', 'C7', 'C8', 'C9'],
      ['D7', 'D8', 'D9', 'E7', 'E8', 'E9', 'F7', 'F8', 'F9'],
      ['G7', 'G8', 'G9', 'H7', 'H8', 'H9', 'I7', 'I8', 'I9']
    ];

    if (parsed.valid) errorMsg.innerHTML = `<p>Valid!</p>`;
    else {
      const coord = stuff.coordinate.toUpperCase().split("");
      const val = stuff.value;

      if (parsed.conflict.includes('row')) {
        const row = coord[0];
        for (let i = 1; i <= 9; i++) {
          const cellClass = `${row}${i}`
          const cell = document.querySelector(`.${cellClass}`);
          const inp = document.querySelector(`.${row.toLowerCase()}${i}`);
          if (inp.value == val && cellClass !== coord.join('')) {
            console.log(cellClass, coord.join(''))
            styleCell(cell);
          }
        }
      }
      else if (parsed.conflict.includes('column')) {
        const column = coord[1];

        for (let row of rows) {
          const cell = document.querySelector(`.${row}${column}`);
          const inp = document.querySelector(`.${row.toLowerCase()}${column}`)
          if (inp.value == val && cellClass !== coord.join('')) {
            console.log(cellClass, coord.join(''))
            styleCell(cell);
          }
        }
      }
      else if (parsed.conflict.includes('region')) {
        const region = regions.find(reg => reg.includes(coord.join('')) );
        for (let cell of region) {
          const currCell = document.querySelector(`.${cell}`);
          const inp = document.querySelector(`.${cell.toLowerCase()}`);
          if (inp.value == val && cellClass !== coord.join('')) {
            console.log(cellClass, coord.join(''))
            styleCell(currCell);
          }
        }
      }
    }
  }
}

async function placeValue() {
  //cleanup first
  if (lastCells.length) {
    for (let lastCell of lastCells) {
      lastCell.cell.style.backgroundColor = lastCell.initColor;
    }
    lastCells = [];
  }

  const stuff = {"puzzle": textArea.value, "coordinate": coordInput.value, "value": valInput.value}
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const coordinate = stuff.coordinate.toUpperCase().split('');
  const row = rows.indexOf(coordinate[0]);
  const col = coordinate[1];

  const position = (9 * row) + (Number(col) - 1);
  if (valInput.value === '.' || valInput.value === '' || valInput.value === ' ') {
    const newText = textArea.value.split('');
    newText[position] = stuff.value;
    textArea.value = newText.join('');
    textArea.dispatchEvent(new Event('input', { bubbles: true }))
    return;
  }
  
  const data = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    body: JSON.stringify(stuff)
  })
  const parsed = await data.json();
  if (parsed.error && parsed.error !== 'Required field(s) missing') errorMsg.innerHTML = `<p>${parsed.error}</p>`;
  else {
    const newText = textArea.value.split('');
    newText[position] = stuff.value;
    textArea.value = newText.join('');
    textArea.dispatchEvent(new Event('input', { bubbles: true }))
  }  
}

document.getElementById("solve-button").addEventListener("click", getSolved)
document.getElementById("check-button").addEventListener("click", getChecked)
document.getElementById("enter-button").addEventListener("click", placeValue)
document.getElementById("new-puzzle").addEventListener("click", randomPuzzle)