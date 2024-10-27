# Temporal Layers 
A cellular automaton game inspired by [Conway's Game of Life](https://playgameoflife.com/). where each cell (square) has parameters defined for whether it 'lives', 'dies', or 'resurrects'. 
However, this version comes with a twist: A third dimension! Traditionally, cells only interact with ones that are directly above, below, to the left, and to the right of itself. 
In Temporal Layers, they are able to interact with the cells behind and in front of them, represented by different layers!
## How it was built
For the majority of the project besides some styling with CSS and additional elements in HTML, we used Javascript (specifically P5.js) for all of the rendering and logic. 
We started by creating a 'Cell' class, and initializing the game board, and that evolved into rendering cells, randomizing layer contents, creating custom gradients, 
defining rules and logic for cells, and more!
