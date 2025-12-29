const NUMBER_OF_LETTERS = 5;

let col = 0;
let row = 0;

function get_raster(r, c) {
    let raster = NUMBER_OF_LETTERS * r + c;
    return raster;
}

document.addEventListener("DOMContentLoaded", async () => {
    // load answer words (can be selected)
    const answerResponse = await fetch("shuffled_real_wordles.txt");
    const answerText = await answerResponse.text();

    const answerSet = new Set(
        answerText
            .trim()
            .split("\n")
            .map(w => w.trim().toUpperCase())
    );

    // load valid guess words (NOT necessarily answers)
    const guessResponse = await fetch("valid-wordle-words.txt");
    const guessText = await guessResponse.text();

    const guessSet = new Set(
        guessText
            .trim()
            .split("\n")
            .map(w => w.trim().toUpperCase())
    );

    console.log("Answers:", answerSet.size);
    console.log("Guesses:", guessSet.size);

    // ---- main game logic starts here ----

    // Code starts here, think of this as main()
    console.log("DOM just finished loading, I think this means some sort of graph object was created from the initial HTML/CSS");
    const tile_array = document.querySelectorAll(".tile");  // This returns a NodeList not an array I guess? Not too sure on the details here 
    const alphabet = new Set([
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ]);

    const html_key_ranks = document.querySelectorAll(".key");
    const keyIndexPairs = [
        ["Q", 0], ["W", 1], ["E", 2], ["R", 3], ["T", 4],
        ["Y", 5], ["U", 6], ["I", 7], ["O", 8], ["P", 9],
        ["A", 10], ["S", 11], ["D", 12], ["F", 13], ["G", 14],
        ["H", 15], ["J", 16], ["K", 17], ["L", 18],
        ["ENTER", 19],
        ["Z", 20], ["X", 21], ["C", 22], ["V", 23], ["B", 24],
        ["N", 25], ["M", 26],
        ["BACKSPACE", 27]
    ];
    const key_index_map = new Map(keyIndexPairs);
    const answer_array = Array.from(answerSet);
    const index = Math.floor(Math.random() * answer_array.length);
    // const word = word_array[index]; // TODO: Make this hidden in the frontend
    const word = answer_array[index];
    const letter_set = new Set(word);

    let guess = "";
    let guessed_words = new Set();

    document.addEventListener("keydown", function (e) {

        let key = e.key.toUpperCase();
        console.log("User just input this key:", key);
        if (alphabet.has(key)) {
            if (col == NUMBER_OF_LETTERS) {
                return;
            }
            // Select tile
            let rast_ind = get_raster(row, col);
            let tile = tile_array[rast_ind];
            // 
            tile.textContent = key;
            guess += key;
            col++;
        }

        if (key == "ENTER") {
            if (col != NUMBER_OF_LETTERS) {
                return; // TODO: Add animation and/or popup saying there are not enough letters
            }
            // Problem: If the word is Ready, and I guess Eerie, the first 'E' is colored yellow when it should be grey. 
            // If the guess has a letter in the correct spot, duplicates of this letter which are out of place should be grey.
            // If the guess does not have this letter in the correct spot, all instances of this letter should be colored yellow. 
            // Create a set of letters which are correctly aligned. Gate the present if condition with !guessed.set.has(key)
            const guessed_set = new Set();
            for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
                if (guess[i] == word[i]) {
                    guessed_set.add(guess[i]);
                }
            }
            if (guessSet.has(guess)) {
                if (guessed_words.has(guess)) {
                    console.log("Word has already been guessed!");
                    return;
                    // TODO: Add animation/popup saying this word has already been guessed
                }
                guessed_words.add(guess);
                console.log("This guess is in the word list.");

                for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
                    // Get the tile (all in the same row)
                    let rast_ind = get_raster(row, i);
                    let tile = tile_array[rast_ind];
                    let key_index = key_index_map.get(guess[i]);
                    if (guess[i] == word[i]) {
                        // Color tiles and keys green (.correct)
                        tile.classList.add("correct");
                        html_key_ranks[key_index].classList.remove("absent", "present", "correct", "absent_key");
                        html_key_ranks[key_index].classList.add("correct");
                    } else if (letter_set.has(guess[i]) && !guessed_set.has(guess[i])) {
                        // Color tiles and keys yellow (.present)
                        tile.classList.add("present");
                        if (!html_key_ranks[key_index].classList.contains("correct")) {
                            html_key_ranks[key_index].classList.add("present");
                        }
                    } else {
                        // tiles and keys grey (.absent)
                        tile.classList.add("absent");
                        if (!guessed_set.has(guess[i])) {
                            html_key_ranks[key_index].classList.add("absent_key");
                        }

                    }
                }

                if (guess == word) {
                    console.log("User correctly guessed the word.");
                    return; // TODO: Add animation/popup

                } else {
                    console.log("User incorrectly guessed the word.");
                    // Reset guess on the next row
                    row++;
                    if (row == 6) {
                        alert(`So close 😭 The word was ${word}.`);
                    }
                    col = 0;
                    guess = "";
                }

            } else {
                console.log("This guess is not in the word list.");
                return; // TODO: Add popup/animation
            }


        }

        if (key == "BACKSPACE") {
            if (col == 0) {
                return;
            }
            col--;
            let rast_ind = get_raster(row, col);
            let tile = tile_array[rast_ind];
            tile.textContent = "";
            guess = guess.slice(0, -1);
        }


    });
});

