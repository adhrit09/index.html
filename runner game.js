<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runner Game</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(to bottom, #7dd3fc, #e0f2fe);
        }
        
        .container {
            text-align: center;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
        }
        
        #gameCanvas {
            border: 4px solid #1f2937;
            border-radius: 0.5rem;
            background: white;
            cursor: pointer;
            display: block;
            margin: 0 auto;
        }
        
        .controls {
            margin-top: 1rem;
            color: #374151;
        }
        
        .controls p {
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .btn {
            padding: 1rem 2rem;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-start {
            background: #22c55e;
        }
        
        .btn-start:hover {
            background: #16a34a;
        }
        
        .btn-restart {
            background: #3b82f6;
        }
        
        .btn-restart:hover {
            background: #2563eb;
        }
        
        .overlay-text {
            color: white;
            margin: 0.5rem 0;
        }
        
        .game-wrapper {
            position: relative;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Runner Game</h1>
        <div class="game-wrapper">
            <canvas id="gameCanvas" width="600" height="400"></canvas>
            <div id="startOverlay" class="overlay">
                <button class="btn btn-start" onclick="startGame()">Start Game</button>
                <p class="overlay-text" style="font-size: 1.125rem; margin-top: 1rem;">Press SPACE or TAP to jump</p>
            </div>
            <div id="gameOverOverlay" class="overlay" style="display: none;">
                <h2 class="overlay-text" style="font-size: 2.25rem; margin-bottom: 0.5rem;">Game Over!</h2>
                <p class="overlay-text" style="font-size: 1.5rem; margin-bottom: 1rem;">Score: <span id="finalScore">0</span></p>
                <button class="btn btn-restart" onclick="resetGame()">Play Again</button>
            </div>
        </div>
        <div class="controls">
            <p>Controls: Press SPACE or TAP/CLICK to jump over obstacles!</p>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const GROUND = 250;
        const GRAVITY = 0.6;
        const JUMP_FORCE = -12;
        const PLAYER_SIZE = 40;
        const OBSTACLE_WIDTH = 30;
        const OBSTACLE_HEIGHT = 50;
        
        let playerY = GROUND;
        let velocity = 0;
        let isJumping = false;
        let obstacles = [];
        let score = 0;
        let gameOver = false;
        let gameStarted = false;
        let animationId = null;
        
        function handleJump() {
            if (!isJumping && gameStarted && !gameOver) {
                velocity = JUMP_FORCE;
                isJumping = true;
            }
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        });
        
        // Mouse/Touch controls
        canvas.addEventListener('click', handleJump);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleJump();
        });
        
        function startGame() {
            document.getElementById('startOverlay').style.display = 'none';
            gameStarted = true;
            gameOver = false;
            score = 0;
            obstacles = [];
            playerY = GROUND;
            velocity = 0;
            isJumping = false;
            gameLoop();
        }
        
        function resetGame() {
            document.getElementById('gameOverOverlay').style.display = 'none';
            document.getElementById('startOverlay').style.display = 'flex';
            gameStarted = false;
            gameOver = false;
            score = 0;
            obstacles = [];
            playerY = GROUND;
            velocity = 0;
            isJumping = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            draw();
        }
        
        function updatePlayer() {
            velocity += GRAVITY;
            playerY += velocity;
            
            if (playerY >= GROUND) {
                playerY = GROUND;
                velocity = 0;
                isJumping = false;
            }
        }
        
        function updateObstacles() {
            // Move obstacles
            obstacles = obstacles.map(obs => ({
                ...obs,
                x: obs.x - 5
            })).filter(obs => obs.x > -OBSTACLE_WIDTH);
            
            // Add new obstacles
            if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < 400) {
                if (Math.random() < 0.02) {
                    obstacles.push({ x: 600, y: GROUND });
                }
            }
        }
        
        function checkCollisions() {
            for (let obs of obstacles) {
                if (
                    obs.x < 100 + PLAYER_SIZE &&
                    obs.x + OBSTACLE_WIDTH > 100 &&
                    playerY + PLAYER_SIZE > obs.y - OBSTACLE_HEIGHT
                ) {
                    gameOver = true;
                    document.getElementById('finalScore').textContent = Math.floor(score / 10);
                    document.getElementById('gameOverOverlay').style.display = 'flex';
                }
            }
        }
        
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw ground
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(0, 320, 600, 80);
            
            // Draw ground line
            ctx.fillStyle = '#15803d';
            ctx.fillRect(0, 320, 600, 4);
            
            // Draw player
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(100, playerY, PLAYER_SIZE, PLAYER_SIZE);
            
            // Draw player eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(108, playerY + 8, 8, 8);
            ctx.fillRect(124, playerY + 8, 8, 8);
            
            // Draw obstacles
            ctx.fillStyle = '#dc2626';
            for (let obs of obstacles) {
                ctx.fillRect(obs.x, obs.y - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
            }
            
            // Draw score
            if (gameStarted) {
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('Score: ' + Math.floor(score / 10), 580, 40);
            }
        }
        
        function gameLoop() {
            if (!gameStarted || gameOver) return;
            
            updatePlayer();
            updateObstacles();
            checkCollisions();
            draw();
            
            if (!gameOver) {
                score++;
            }
            
            animationId = requestAnimationFrame(gameLoop);
        }
        
        // Initial draw
        draw();
    </script>
</body>
</html>
