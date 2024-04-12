//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 60; //width/height ratio = 408/228 = 17/12
let birdHeight = 48;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdSprites = [];
let currentSpriteIndex = 0;
let spriteChangeInterval = 100; // Milliseconds between sprite changes
let lastSpriteChangeTime = 0;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load bird sprites
    for (let i = 1; i <= 3; i++) {
        let sprite = new Image();
        sprite.src = `./bird${i}.png`;
        birdSprites.push(sprite);
    }

    //load images
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1600); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update(timestamp) {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Update bird sprite
    let currentTime = Date.now();
    if (currentTime - lastSpriteChangeTime >= spriteChangeInterval) {
        currentSpriteIndex = (currentSpriteIndex + 1) % birdSprites.length;
        lastSpriteChangeTime = currentTime;
    }

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdSprites[currentSpriteIndex], bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

let canJump = true;
let jumpCooldown = 100; // milliseconds, adjust as needed
let lastJumpTime = 0;

function moveBird(e) {
    let currentTime = Date.now();
    if ((e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") && canJump) {
        // Check if enough time has passed since the last jump
        if (currentTime - lastJumpTime >= jumpCooldown) {
            // Jump
            velocityY = -6;

            // Update last jump time
            lastJumpTime = currentTime;

            // Reset game if it's over
            if (gameOver) {
                bird.y = birdY;
                pipeArray = [];
                score = 0;
                gameOver = false;
            }

            // Set canJump to false to start cooldown
            canJump = false;

            // Schedule resetting canJump to true after cooldown
            setTimeout(() => {
                canJump = true;
            }, jumpCooldown);
        }
    }
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
