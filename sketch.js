let displaySize = 900;
let cellSize = 10;
let timeStep = 1; // time between frames in seconds;
let dims = displaySize/cellSize;

let currentTimeStep = Math.floor(dims/2)
let frameSlider;

/*
[
 [[], [], [], ...],
 [[], [], [], ...],
 [[], [], [], ...]
 ...
]
*/
let gameBoard = (()=>{
  var arr = new Array(dims);

  for(var i = 0; i < dims; i++){
    arr[i] = new Array(dims);
    for(var j = 0; j < dims; j++){
      arr[i][j] = new Array(dims);
    }
  }
  return arr;
})();

// remove oldest time step and add new time step to end of list
// 90 frames are stored per value
function stepTime(){
  for(var y = 0; y < dims; y++){
    for(var x = 0; x < dims; x++){
      gameBoard[y][x].push(new Array(dims));
      gameBoard[y][x].shift();
    }
  }
}

class Cell {
  constructor(living, color){
    this.living = living
    this.color = color
  }

  get livingState() {
    return this.living
  }

  get cellColor(){
    return this.color
  }
}



function setup() {
  createCanvas(displaySize, displaySize);

  frameRate(timeStep);
  frameSlider = createSlider(0, 90)
  frameSlider.position(700, 100)
}

function draw() {
  background(220);
  // shiftTime();
}