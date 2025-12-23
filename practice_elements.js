const NUMBER_OF_LETTERS = 5;

let col = 0;
let row = 0;

function get_raster(r,c) {
    let raster = NUMBER_OF_LETTERS * r + c;
    return raster;
}

document.addEventListener("DOMContentLoaded", function() {
    // Code starts here, think of this as main()
    console.log("DOM just finished loading, I think this means some sort of graph object was created from the initial HTML/CSS");
    const tile_array = document.querySelectorAll(".tile");  
    const alphabet = new Set([ "a","b","c","d","e","f","g","h","i","j","k","l","m",
                               "n","o","p","q","r","s","t","u","v","w","x","y","z"]);
    
    document.addEventListener("keydown", function(e){
        let rast_ind = get_raster(row, col);
        let key = e.key;
        console.log("User just input this key:", key);
        if (alphabet.has(key)) {
            if (col == 5) {
                return;
            }
            
            let tile = tile_array[rast_ind];
            tile.textContent = key.toUpperCase();
            col++;
        }
    });
} );

