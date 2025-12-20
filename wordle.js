document.addEventListener("DOMContentLoaded", function() {
    // Content of page goes here (once things load)
    const grid = document.getElementById("grid");
    const keyboard = document.getElementById("keyboard");
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.dataset.row = row;
            tile.dataset.col = col;
            grid.appendChild(tile);
        }
    }
});