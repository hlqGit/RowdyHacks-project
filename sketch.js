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

/* 
Creates a gradient and returns a color from it. Given a starting color & ending color,
steps in the gradient, and what step to get from the gradient.
*/
function gradient(startColor, endColor, totalGradientSteps, currentStep) {
  const r = Math.floor(startColor[0] + ((endColor[0] - startColor[0]) * currentStep) / totalGradientSteps);
  const g = Math.floor(startColor[1] + ((endColor[1] - startColor[1]) * currentStep) / totalGradientSteps);
  const b = Math.floor(startColor[2] + ((endColor[2] - startColor[2]) * currentStep) / totalGradientSteps);
  return [r, g, b];
}

/* 
Initializes the game board with cells. Randomly selects cells to be live and dead.
Math.random must be larger than the variable 'odds' to place a living cell.
*/
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
        for(var z = 0; z < timeLayers-1; z++){
          testCell = gameBoard[y][x][z]
          if(testCell.livingState){
            fill(gradient([255,0,0], [0, 0, 255], timeLayers, z))
            rect(snappedX, snappedY, cellSize, cellSize)
          }
        }
      } else {
        testCell = gameBoard[y][x][currentTimeStep-1]
        if(testCell.livingState){
          fill(gradient([255,0,0], [0, 0, 255], timeLayers, currentTimeStep))
          rect(snappedX, snappedY, cellSize, cellSize);
        }  else { // Uncomment else for white cells to have a border. *******
          // fill(255)
          // rect(snappedX, snappedY, cellSize, cellSize);
        }
      }
    }
  }
}

function setup() {
  createCanvas(displaySize, displaySize);

  // Initializes config menu: View Layer Slider.
  layerSlider = createSlider(1, 10, 1)
  layerSlider.position(700, 100)
  layerSlider.size(80)
  layerSliderText = createInput()
  layerSliderText.size(25)
  layerSliderText.position(795, 100)
  layerSliderText.value(layerSlider.value())
  layerSliderTip = createP('View Layer:')
  layerSliderTip.position(705, 70)

  // Initializes config menu: Z-Axis Layers Slider.
  timeLayersAmount = createSlider(10, 20, 10)
  timeLayersAmount.position(700, 150)
  timeLayersAmount.size(80)
  timeLayersAmountText = createInput()
  timeLayersAmountText.size(25)
  timeLayersAmountText.position(795, 150)
  timeLayersAmountText.value(timeLayersAmount.value())
  timeLayersAmountTip = createP('Amount of Z-Axis layers:')
  timeLayersAmountTip.position(705, 120)

  // Initializes config menu: Updates Per Second Slider.
  updateTimerSlider = createSlider(0.25, 5, 1, 0.25)
  updateTimerSlider.position(700, 200)
  updateTimerSlider.size(80)
  updateTimerText = createInput()
  updateTimerText.size(25)
  updateTimerText.position(795, 200)
  updateTimerText.value(updateTimerSlider.value())
  updateTimerTip = createP('Update Speed (Per Second):')
  updateTimerTip.position(700, 170)
  
  // Initializes config menu: Display All Checkbox.
  displayAllCheckbox = createCheckbox();
  displayAllCheckbox.position(803, 232);
  displayAllTip = createP('Display all layers?')
  displayAllTip.position(705, 223)

  // Initializes config menu: Tip For Hiding Config.
  configTip = createP('Push \'c\' to show/hide config')
  configTip.position(701, 250)
  
  // Initializes each layer with random cells.
  randomCells(0.25)
}

function draw() {
  checkInitialization();
  background(255);

  displayAll = displayAllCheckbox.checked();

  // .input methods: Runs if slider/textbox value has changed.
  layerSliderText.input(updateViewLayerSlider);
  layerSlider.input(updateViewLayerTextBox);
  currentTimeStep = layerSlider.value();
  timeLayersAmountText.input(updateTimeLayerSlider);
  timeLayersAmount.input(updateTimeLayerTextBox);
  updateTimerText.input(updateUpdateTimerSlider);
  updateTimerSlider.input(updateUpdateTimerText);
  
  // Switches framerate to its slider value
  timeStep = updateTimerSlider.value();
  frameRate(timeStep);

  renderBoard() // Draws each live cell
  drawConfigBox() // Overlay config box over board
  applyCellRules() // Runs logic rules for cells & updates their values
  verifyTimeLayers() // Makes sure (current z-axis layer) < (total z-axis layers)
  // stepTime(); to be implemented?
}

// Makes sure (current z-axis layer) < (total z-axis layers)
function verifyTimeLayers(){
  timeLayers = timeLayersAmount.value()
  if (layerSlider.value() > timeLayers) {
    console.log(true)
    layerSlider.value(timeLayers);
    layerSliderText.value(10)
  }
  layerSlider.elt.max = timeLayers;
}

// Draws black transparent box behind config menu
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
    updateTimerSlider.show()
    updateTimerText.show()
    updateTimerTip.show()
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
    updateTimerSlider.hide()
    updateTimerText.hide()
    updateTimerTip.hide()
    configTip.hide()
  }
}

/*
Add new cell rules here, default rules already implemented. If needed,
They can be changed later too depending on new rules implemented.
*/

function applyCellRules(){
  for(y = 0; y < dims; y++){
    for(x = 0; x < dims; x++) {
      for(z = 0; z < timeLayers; z++){
        liveNeighbors = countLiveNeighbors(y, x, z)
        cellState = gameBoard[y][x][z]
        if(liveNeighbors < 6) {
          cellState.die()
          gameBoard[y][x][z] = cellState
        }
        if(liveNeighbors == 9 || liveNeighbors == 10){
          cellState.resurrect()
          gameBoard[y][x][z] = cellState
        }
        if(liveNeighbors >= 11){
          cellState.die()
          gameBoard[y][x][z] = cellState
        }      
      }
    }
  }
}

// RULESET 1 - MAKES COOL 3D SHAPES
// function applyCellRules(){
//   for(y = 0; y < dims; y++){
//     for(x = 0; x < dims; x++) {
//       for(z = 0; z < timeLayers; z++){
//         liveNeighbors = countLiveNeighbors(y, x, z)
//         cellState = gameBoard[y][x][z]
//         if(liveNeighbors < 6) {
//           cellState.die()
//           gameBoard[y][x][z] = cellState
//         }
//         if(liveNeighbors >= 9 && liveNeighbors <= 10){
//           cellState.resurrect()
//           gameBoard[y][x][z] = cellState
//         }
//         if(liveNeighbors >= 11){
//           cellState.die()
//           gameBoard[y][x][z] = cellState
//         }      
//       }
//     }
//   }
// }

// Returns how many (out of 26) neighbors are living
function countLiveNeighbors(y, x, z) {
  let liveNeighbors = 0;
  for (let dy = -1; dy <= 1; dy++){
    for (let dx = -1; dx <= 1; dx++){
      for (let dz = -1; dz <= 1; dz++){
        if (dy === 0 && dx === 0 && dz === 0){
          continue;
        } 

        let ny = y + dy;
        let nx = x + dx;
        let nz = z + dz;

        if (ny >= 0 && ny < dims && nx >= 0 && nx < dims && nz >= 0 && nz < timeLayers){
          if (gameBoard[ny][nx][nz] && gameBoard[ny][nx][nz].livingState){
            liveNeighbors++;
          }
        }
      }
    }
  }
  return liveNeighbors;
}


// Does not allow text box value of View Layer Slider to be changed.
function updateViewLayerSlider(){
  layerSliderText.value(layerSlider.value())
}

// If the View Layer Slider is changed, reflect change in text box.
function updateViewLayerTextBox(){
  layerSliderText.value(layerSlider.value())
}

/*
Adds the new cells to the Z-Axis. Does not allow text box value
for the Amount of Z-Axis layers to be changed.
*/
function updateTimeLayerSlider(){
  timeLayersAmountText.value(timeLayersAmount.value())
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

/* 
If the slider is changed for the Amount of Z-Axis layers, 
reflect change in text box.
*/
function updateTimeLayerTextBox(){
  timeLayersAmountText.value(timeLayersAmount.value())
}

// Does not allow text box value of Update Speed slider to be changed.
function updateUpdateTimerSlider(){
  updateTimerText.value(updateTimerSlider.value())
  timeStep = updateTimerSlider.value()
}
// If the Update Speed slider is changed, reflect change in text box
function updateUpdateTimerText(){
  updateTimerText.value(updateTimerSlider.value())
}

// Initializes uninitialized cells
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

// listens for pause (space) and toggle config (c)
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