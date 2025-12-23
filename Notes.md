For wordle, we really only need <div> containers, id / class, and <script> tag. 

<div> + id/class
    Use an id for a specific thing I will need in JS
    Use a class for a thing that will come up repeatedly, a tile, row, etc

    <div> has no semantic meaning. Its a generic building block

<script> tells the browser to load and run JavaScript
    Two common ways I will use it:
        <script src="script.js></script>
            This loads script.js
            Executes script.js when the broswer reaches this line
        Inline JavaScript (usually worse)
            <script>
                console.log("hello");
            </script>