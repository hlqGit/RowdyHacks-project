let displaySize = 900;
let cellSize = 10;
let timeStep = 1; // time between frames in seconds;
let dims = displaySize/cellSize;
let timeLayers = 10

let currentTimeStep = 0;
let layerSlider;
let layerSliderText;

let timeLayersAmount;
let timeLayersAmountText;

let displayAll = false;
let displayAllCheckbox;

let paused = false;

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
      arr[i][j] = new Array(timeLayers);
    }
  }
  return arr;
})();

// remove oldest time step and add new time step to end of list
// 90 frames are stored per value
function stepTime(){
  for(var y = 0; y < dims; y++){
    for(var x = 0; x < dims; x++){
      gameBoard[y][x].push(new Array(timeLayers));
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

  die(){
    this.living = false
  }

  resurrect(){
    this.living = true
  }
}

// function gradient(startColor, endColor, steps, position) {
//   if (position < 0 || position >= steps) {
//     throw new Error("Position must be within the range of steps");
//   }

//   // Calculate the step increments for each RGB channel
//   const stepR = (endColor[0] - startColor[0]) / (steps - 1);
//   const stepG = (endColor[1] - startColor[1]) / (steps - 1);
//   const stepB = (endColor[2] - startColor[2]) / (steps - 1);

//   // Calculate color at the specified position
//   const r = Math.round(startColor[0] + stepR * position);
//   const g = Math.round(startColor[1] + stepG * position);
//   const b = Math.round(startColor[2] + stepB * position);

//   return `rgb(${r}, ${g}, ${b})`;
// }

function gradient(startColor, endColor, totalGradientSteps, currentStep) {
  // Calculate the interpolated color for each component
  const r = Math.floor(startColor[0] + ((endColor[0] - startColor[0]) * currentStep) / totalGradientSteps);
  const g = Math.floor(startColor[1] + ((endColor[1] - startColor[1]) * currentStep) / totalGradientSteps);
  const b = Math.floor(startColor[2] + ((endColor[2] - startColor[2]) * currentStep) / totalGradientSteps);

  // Return the color as an array
  return [r, g, b];
}

// input, odds must be larger than what Math.random returns in order for a cell to be placed
function randomCells(odds){
  for(var y = 0; y < dims; y++){
    for(var x = 0; x < dims; x++){
      for(var z = 0; z < timeLayers; z++){
        if(odds > Math.random()){
          gameBoard[y][x][z] = new Cell(true, gradient([255,0,0], [0, 255, 255], timeLayers, currentTimeStep));
        } else {
          gameBoard[y][x][z] = new Cell(false, 255, timeLayers, currentTimeStep)
        }
      }
    }
  }
}

function renderBoard(){
  for(var y = 0; y < dims; y++){
    for(var x = 0; x < dims; x++){
      var snappedX = cellSize * x;
      var snappedY = cellSize * y;
      if(displayAll){
        for(var z = 0; z < dims; z++){
          testCell = gameBoard[y][x][currentTimeStep-1]
          if(testCell.livingState){
            fill(gradient([255,0,0], [255, 0, 77], dims, z))
            rect(snappedX, snappedY, cellSize, cellSize);
          }
        }
      } else {
        testCell = gameBoard[y][x][currentTimeStep-1]
        if(testCell.livingState){
          //console.log(x, y, currentTimeStep, gameBoard[y][x][currentTimeStep])
          fill(gradient([255,0,0], [0, 0, 255], timeLayers, currentTimeStep))
          rect(snappedX, snappedY, cellSize, cellSize);
        }  else {
          //console.log(x, y, currentTimeStep, gameBoard[y][x][currentTimeStep])
          fill(255)
          rect(snappedX, snappedY, cellSize, cellSize);
        }
      }
    }
  }
}

function setup() {
  createCanvas(displaySize, displaySize);
  console.log(dims)
  frameRate(timeStep);
  layerSlider = createSlider(1, 10)
  layerSlider.value(0)
  layerSlider.position(700, 100)
  layerSliderText = createInput()
  layerSliderText.size(25)
  layerSliderText.position(700, 80)
  layerSliderText.value(layerSlider.value())

  timeLayersAmount = createSlider(10, 10)
  timeLayersAmount.position(700, 150)
  timeLayersAmount.value(10)
  timeLayersAmountText = createInput()
  timeLayersAmountText.size(25)
  timeLayersAmountText.position(700, 130)
  timeLayersAmountText.value(timeLayersAmount.value())

  console.log(gameBoard[0])
  displayAllCheckbox = createCheckbox();
  displayAllCheckbox.position(700, 200);
  randomCells(0.3)
  // console.log(gameBoard)
}

function draw() {
  background(255);
  displayAll = displayAllCheckbox.checked();
  layerSliderText.input(updateViewLayerSlider);
  layerSlider.input(updateViewLayerTextBox);
  currentTimeStep = layerSlider.value();
  timeLayersAmountText.input(updateTimeLayerSlider);
  timeLayersAmount.input(updateTimeLayerTextBox);
  timeLayers = timeLayersAmount.value()
  renderBoard()
  applyCellRules()
  // stepTime();
}

function applyCellRules(){
  for(y = 0; y < dims; y++){
    for(x = 0; x < dims; x++) {
      for(z = 0; z < timeLayers; z++){
        liveNeighbors = countLiveNeighbors(y, x, z)
        cellState = gameBoard[y][x][z]
        if(liveNeighbors < 1) {
          cellState.die()
          gameBoard[y][x][z] = cellState
        }
        if(liveNeighbors > 2 && liveNeighbors < 4){
          cellState.resurrect()
          gameBoard[y][x][z] = cellState
        }
        if(liveNeighbors >= 4){
          cellState.die()
          gameBoard[y][x][z] = cellState
        }
      }
    }
  }
}

function countLiveNeighbors(y, x, z){
  let liveNeighbors = 0
  if(!(y - 1 < 0)) {
    checkCell = gameBoard[y-1][x][z]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  if(!(y + 1 > dims-1)){
    checkCell = gameBoard[y+1][x][z]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  if(!(x - 1 < 0)) {
    checkCell = gameBoard[y][x-1][z]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  if(!(x + 1 > dims-1)){
    checkCell = gameBoard[y][x+1][z]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  if(!(z - 1 < 0)) {
    checkCell = gameBoard[y][x][z-1]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  if(!(z + 1 > timeLayers-1)){
    checkCell = gameBoard[y][x][z+1]
    if(checkCell.livingState) {
      liveNeighbors++;
    }
  }
  return liveNeighbors;
}

function updateViewLayerSlider(){
  let inputVal = layerSliderText.value()
  let valCheck = inputVal.charCodeAt(inputVal.length -1)
  if(inputVal.charCodeAt(0) == 48) {
    layerSliderText.value(inputVal.substring(1))
  }

  // if it isn't a number, delete it
  if(!(valCheck > 47 && valCheck < 58)) {
    layerSliderText.value(inputVal.substring(0, inputVal.length-1))
  }
  //if it's greater than 90, it isn't
  if(inputVal > 90) {
    layerSlider.value(90)
    layerSliderText.value(90)
  } else {
    layerSlider.value(layerSliderText.value())
  }
  inputVal = layerSliderText.value()
  if(inputVal == "") {
    layerSliderText.value(0)
    layerSlider.value(layerSliderText.value())
  }
}

function updateViewLayerTextBox(){
  layerSliderText.value(layerSlider.value())
}

function updateTimeLayerSlider(){
  let inputVal = timeLayersAmountText.value()
  let valCheck = inputVal.charCodeAt(inputVal.length -1)
  if(inputVal.charCodeAt(0) == 48) {
    timeLayersAmountText.value(inputVal.substring(1))
  }

  // if it isn't a number, delete it
  if(!(valCheck > 47 && valCheck < 58)) {
    timeLayersAmountText.value(inputVal.substring(0, inputVal.length-1))
  }
  //if it's greater than 90, it isn't
  if(inputVal > 90) {
    timeLayersAmount.value(90)
    timeLayersAmountText.value(90)
  } else {
    timeLayersAmount.value(timeLayersAmountText.value())
  }
  inputVal = timeLayersAmountText.value()
  if(inputVal == "") {
    timeLayersAmountText.value(0)
    timeLayersAmount.value(timeLayersAmountText.value())
  }
}

function updateTimeLayerTextBox(){
  timeLayersAmountText.value(timeLayersAmount.value())
}

function keyPressed(e){
  if(keyCode == 32){
    paused = !paused;
    if(paused){
      noLoop();
    }else{
      loop();
    }
  }
}