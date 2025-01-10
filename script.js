document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const memorizingEl = document.getElementById("memorizing-time");
  const healthEl = document.getElementById("health");

  canvas.width = 600;
  canvas.height = 600;

  let cellSize = 60;
  let startCell = { x: 0, y: 0 };
  let endCell = { x: 0, y: 0 };
  let initial = null;
  let memorizingTime = 10;
  let health = 3;
  let gameover = false;
  let memorizingInterval = null;
  let animationid = null;

  let grids = [];
  let walls = [];

  function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawHearth() {
    healthEl.innerHTML = `Health: ${Array(health).fill("❤️").join("")}`;
  }

  function createGrid() {
    for (let x = 0; x < canvas.width; x += cellSize) {
      for (let y = 0; y < canvas.height; y += cellSize) {
        grids.push({
          x: x,
          y: y,
          width: cellSize,
          height: cellSize,
        });
      }
    }
  }
  createGrid();

  function drawGrid() {
    for (let i = 0; i < grids.length; i++) {
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.strokeRect(grids[i].x, grids[i].y, grids[i].width, grids[i].height);
    }
  }

  function initGame() {
    const randomPositionStartY = getRandomInt(0, 5) * 100;
    let randomPositionEndY;

    startCell = {
      x: 0,
      y: randomPositionStartY - (randomPositionStartY % cellSize) + cellSize,
    };

    do {
      randomPositionEndY = getRandomInt(0, 5) * 100;
    } while (randomPositionStartY === randomPositionEndY);

    endCell = {
      x: canvas.width - cellSize,
      y: randomPositionEndY - (randomPositionEndY % cellSize) + cellSize,
    };

    initial = { x: startCell.x, y: startCell.y };
  }
  initGame();

  function drawStartEnd() {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.arc(
      startCell.x + cellSize / 2,
      startCell.y + cellSize / 2,
      cellSize * 0.3,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "yellow";
    ctx.fillRect(endCell.x + 55, endCell.y, 5, cellSize);
    ctx.closePath();
  }

  function generateWalls() {
    do {
      walls = [];
      const usedPositions = new Set();

      for (let i = 0; i < 60; i++) {
        let randomPositionStartX = getRandomInt(0, 6) * 100;
        let randomPositionStartY = getRandomInt(0, 6) * 100;

        let adjustedX =
          randomPositionStartX - (randomPositionStartX % cellSize);
        let adjustedY =
          randomPositionStartY - (randomPositionStartY % cellSize);
        const positionKey = `${adjustedX},${adjustedY}`;

        if (adjustedX >= 600) {
          adjustedX -= cellSize;
        }

        if (adjustedY >= 600) {
          adjustedY -= cellSize;
        }

        if (
          !usedPositions.has(positionKey) &&
          !(adjustedX === startCell.x && adjustedY === startCell.y) &&
          !(adjustedX === endCell.x && adjustedY === endCell.y)
        ) {
          walls.push({ x: adjustedX, y: adjustedY });
          usedPositions.add(positionKey);

          for (let i = 0; i < getRandomInt(2, 5); i++) {
            const direction = getRandomInt(0, 3);
            let newX = adjustedX;
            let newY = adjustedY;

            switch (direction) {
              case 0:
                newY -= cellSize;
                break;
              case 1:
                newY += cellSize;
                break;
              case 2:
                newX -= cellSize;
                break;
              case 3:
                newX += cellSize;
                break;
            }

            const newPositionKey = `${newX},${newY}`;
            if (
              !usedPositions.has(newPositionKey) &&
              newX >= 0 &&
              newX < canvas.width &&
              newY >= 0 &&
              newY < canvas.height &&
              !(newX === startCell.x && newY === startCell.y) &&
              !(newX === endCell.x && newY === endCell.y)
            ) {
              walls.push({ x: newX, y: newY });
              usedPositions.add(newPositionKey);
            }
          }
        }
      }
    } while (!checkValidPath(startCell, endCell));
  }
  generateWalls();

  function checkValidPath(start, end) {
    const visited = new Set();

    function dfs(current) {
      const key = `${current.x},${current.y}`;

      if (current.x === end.x && current.y === end.y) return true;
      if (
        current.x < 0 ||
        current.x >= canvas.width ||
        current.y < 0 ||
        current.y >= canvas.height
      )
        return false;
      if (visited.has(key)) return false;
      if (walls.some((wall) => wall.x === current.x && wall.y === current.y))
        return false;

      visited.add(key);

      const direction = [
        { dx: 0, dy: -cellSize }, // Up dir
        { dx: 0, dy: cellSize }, // Down dir
        { dx: -cellSize, dy: 0 }, // Left dir
        { dx: cellSize, dy: 0 }, // Right dir
      ];

      for (const dir of direction) {
        const next = {
          x: current.x + dir.dx,
          y: current.y + dir.dy,
        };

        if (dfs(next)) return true;
      }

      return false;
    }

    return dfs(start);
  }

  function startMemorizing() {
    memorizingInterval = setInterval(() => {
      if (memorizingTime > 0) {
        memorizingTime--;
        memorizingEl.innerHTML = `Memorizing Time: ${memorizingTime}s`;
      }

      if (memorizingTime === 0) {
        memorizingEl.innerHTML = `Start`;
      }
    }, 1000);
  }
  startMemorizing();

  function drawWalls() {
    if (memorizingTime > 0) {
      for (let i = 0; i < walls.length; i++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(walls[i].x, walls[i].y, cellSize, cellSize);
      }
    }
  }

  function checkWallHit() {
    if (
      walls.some((wall) => wall.x === startCell.x && wall.y === startCell.y)
    ) {
      alert("You hit a wall");
      health--;
      startCell.x = initial.x;
      startCell.y = initial.y;
    }
  }

  function checkGameOver() {
    if (health === 0) {
      gameover = true;
    }
  }
  function displayGameOver() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px Arial";
    ctx.fillText(
      "AWOKWOKAWKO KALAH",
      canvas.width / 2 - 150,
      canvas.height / 2
    );
    ctx.fillText(
      "PRESS SPACE TO PLAY AGAIN",
      canvas.width / 2 - 200,
      canvas.height / 2 + 100
    );
  }

  function animate() {
    if (!gameover) {
      clearBoard();
      drawGrid();
      drawStartEnd();
      drawWalls();
      checkWallHit();
      drawHearth();
      checkGameOver();
    } else {
      displayGameOver();
    }
    requestAnimationFrame(animate);
  }
  animate();

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key;

    const MOVE_UP = "ArrowUp";
    const MOVE_DOWN = "ArrowDown";
    const MOVE_RIGHT = "ArrowRight";
    const MOVE_LEFT = "ArrowLeft";

    if (memorizingTime === 0) {
      switch (true) {
        case key === MOVE_UP && startCell.y > 0:
          startCell.y -= cellSize;
          break;
        case key === MOVE_DOWN && startCell.y < canvas.height - cellSize:
          startCell.y += cellSize;
          break;
        case key === MOVE_RIGHT && startCell.x < canvas.width - cellSize:
          startCell.x += cellSize;
          break;
        case key === MOVE_LEFT && startCell.x > 0:
          startCell.x -= cellSize;
          break;
      }
    }

    if (startCell.x === endCell.x && startCell.y === endCell.y) {
      setTimeout(() => {
        alert("Finish");
        memorizingTime = 10;
        initGame();
        generateWalls();
      }, 200);
    }

    if (gameover && e.keyCode === 32) {
      health = 3;
      gameover = false;
      memorizingTime = 10;
      createGrid();
      initGame();
      generateWalls();
      startMemorizing();
      clearInterval(memorizingInterval);
      cancelAnimationFrame(animationid);
    }
  });
});
