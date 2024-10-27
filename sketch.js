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

let updateTimerSlider;
let updateTimerText;

let displayAll = false;
let displayAllCheckbox;

let paused = false;
let config = true;

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
            rect(snappedX, snappedY, cellSize, cellSize)
          } else {
            fill(255)
            rect(snappedX, snappedY, cellSize, cellSize)
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
  layerSlider = createSlider(1, 10, 1)
  layerSlider.position(700, 100)
  layerSlider.size(80)
  layerSliderText = createInput()
  layerSliderText.size(25)
  layerSliderText.position(795, 100)
  layerSliderText.value(layerSlider.value())
  layerSliderTip = createP('View Layer:')
  layerSliderTip.position(705, 70)

  timeLayersAmount = createSlider(10, 20, 10)
  timeLayersAmount.position(700, 150)
  timeLayersAmount.size(80)
  timeLayersAmountText = createInput()
  timeLayersAmountText.size(25)
  timeLayersAmountText.position(795, 150)
  timeLayersAmountText.value(timeLayersAmount.value())
  timeLayersAmountTip = createP('Amount of Z-Axis layers:')
  timeLayersAmountTip.position(705, 120)

  updateTimerSlider = createSlider(0.5, 5, 1, 0.5)
  updateTimerSlider.position(700, 200)
  updateTimerSlider.size(80)
  updateTimerText = createInput()
  updateTimerText.size(25)
  updateTimerText.position(795, 200)
  updateTimerText.value(updateTimerSlider.value())
  updateTimerTip = createP('Update Speed (Per Second):')
  updateTimerTip.position(700, 170)
  
  displayAllCheckbox = createCheckbox();
  displayAllCheckbox.position(803, 232);
  displayAllTip = createP('Display all layers?')
  displayAllTip.position(705, 223)

  configTip = createP('Push \'c\' to show/hide config')
  configTip.position(701, 250)
  
  randomCells(0.25)
  // console.log(gameBoard)
}

function draw() {
  checkInitialization();
  background(255);
  displayAll = displayAllCheckbox.checked();
  layerSliderText.input(updateViewLayerSlider);
  layerSlider.input(updateViewLayerTextBox);
  currentTimeStep = layerSlider.value();
  timeLayersAmountText.input(updateTimeLayerSlider);
  timeLayersAmount.input(updateTimeLayerTextBox);
  updateTimerText.input(updateUpdateTimerSlider);
  updateTimerSlider.input(updateUpdateTimerText);
  timeStep = updateTimerSlider.value();
  frameRate(timeStep);

  renderBoard()
  drawConfigBox()
  applyCellRules()
  verifyTimeLayers()
  // stepTime();
}

function verifyTimeLayers(){
  timeLayers = timeLayersAmount.value()
  layerSlider.elt.max = timeLayers;
  if (layerSlider.value() > timeLayers) {
    layerSlider.value(timeLayers);
  }
}

function drawConfigBox(){
  if(config){
    fill(0, 220);
    rect(690,65,155,215);
  }
}

function toggleConfig(){
  config = !config
  if(config){
    layerSlider.show()
    layerSliderText.show()
    layerSliderTip.show()
    timeLayersAmount.show()
    timeLayersAmountText.show()
    timeLayersAmountTip.show()
    displayAllCheckbox.show()
    displayAllTip.show()
    drawConfigBox()
  } else {
    layerSlider.hide()
    layerSliderText.hide()
    layerSliderTip.hide()
    timeLayersAmount.hide()
    timeLayersAmountText.hide()
    timeLayersAmountTip.hide()
    displayAllCheckbox.hide()
    displayAllTip.hide()
    configTip.hide()
  }
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

function countLiveNeighbors(y, x, z) {
  let liveNeighbors = 0;
  
  if (y - 1 >= 0 && gameBoard[y - 1][x][z] && gameBoard[y - 1][x][z].livingState) liveNeighbors++;
  if (y + 1 < dims && gameBoard[y + 1][x][z] && gameBoard[y + 1][x][z].livingState) liveNeighbors++;
  if (x - 1 >= 0 && gameBoard[y][x - 1][z] && gameBoard[y][x - 1][z].livingState) liveNeighbors++;
  if (x + 1 < dims && gameBoard[y][x + 1][z] && gameBoard[y][x + 1][z].livingState) liveNeighbors++;
  if (z - 1 >= 0 && gameBoard[y][x][z - 1] && gameBoard[y][x][z - 1].livingState) liveNeighbors++;
  if (z + 1 < timeLayers && gameBoard[y][x][z + 1] && gameBoard[y][x][z + 1].livingState) liveNeighbors++;
  
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
  // if it's greater than 90, it isn't
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
  // if it's greater than 90, it isn't
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
  timeLayers = timeLayersAmount.value();
  for (let y = 0; y < dims; y++) {
    for (let x = 0; x < dims; x++) {
      while (gameBoard[y][x].length < timeLayers) {
        gameBoard[y][x].push(new Cell(false, [255, 255, 255]));
      }
      while (gameBoard[y][x].length > timeLayers) {
        gameBoard[y][x].shift();
      }
    }
  }
}

function updateTimeLayerTextBox(){
  timeLayersAmountText.value(timeLayersAmount.value())
}

function updateUpdateTimerSlider(){
  let inputVal = updateTimerText.value()
  let valCheck = inputVal.charCodeAt(inputVal.length -1)
  if(inputVal.charCodeAt(0) == 48) {
    updateTimerText.value(inputVal.substring(1))
  }

  // if it isn't a number, delete it
  if(!(valCheck > 47 && valCheck < 58)) {
    updateTimerText.value(inputVal.substring(0, inputVal.length-1))
  }
  // if it's greater than 90, it isn't
  if(inputVal > 5) {
    updateTimerSlider.value(5)
    updateTimerText.value(5)
  } else {
    updateTimerSlider.value(updateTimerText.value())
  }
  inputVal = updateTimerText.value()
  if(inputVal == "") {
    updateTimerText.value(0)
    updateTimerSlider.value(updateTimerText.value())
  }
  timeStep = updateTimerSlider.value()
}

function updateUpdateTimerText(){
  updateTimerText.value(updateTimerSlider.value())
}

function checkInitialization() {
  for (let y = 0; y < dims; y++) {
    for (let x = 0; x < dims; x++) {
      for (let z = 0; z < timeLayers; z++) {
        if (!(gameBoard[y][x][z] instanceof Cell)) {
          gameBoard[y][x][z] = new Cell(false, [255, 255, 255]);
        }
      }
    }
  }
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
  if(key === 'c') {
    toggleConfig()
  }
}