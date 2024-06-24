import * as THREE from "./three/three.module.js";

import { OrbitControls } from "./three/addons/OrbitControls.js";

import Arena from "./src/arena.js";
import Paddle from "./src/paddle.js";
import PostProcessing from "./src/post-processing.js";
import InputManager from "./src/input-manager.js";
import Ball from "./src/ball.js";
import GameManager from "./src/game-manager.js";

function startGame() {
  const gameWrapper = document.getElementById("game-wrapper");
  const gameWidth = gameWrapper.offsetWidth;
  const gameHeight = gameWrapper.offsetHeight;

  const arenaWidth = 50;
  const arenaDepth = 30;

  const backgroundImage = new THREE.TextureLoader().load(
    "/static/pong/img/Starfield.png",
  );

  const gameMode = localStorage.getItem("gameMode");

  // Boilerplate
  const scene = new THREE.Scene();
  scene.background = backgroundImage;

  // Create camera
  const camera = new THREE.PerspectiveCamera(45, gameWidth / gameHeight);
  camera.position.set(0, 52, 10);

  // Setup renderer
  const gameCanvas = document.getElementById("game-canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: gameCanvas,
  });
  renderer.setSize(gameWidth, gameHeight);
  renderer.setAnimationLoop(animationLoop);

  new OrbitControls(camera, renderer.domElement);

  // Create directional lights
  const light1 = new THREE.DirectionalLight(0xffffff, 5);
  light1.position.set(30, 0.5, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 5);
  light2.position.set(-30, 0.5, 1);
  scene.add(light2);

  // Setup post processing effects
  const postProcessing = new PostProcessing({
    scene: scene,
    camera: camera,
    renderer: renderer,
    gameWidth: gameWidth,
    gameHeight: gameHeight,
  });
  postProcessing.setup();

  const inputManager = new InputManager({});

  const gameManager = new GameManager({
    maxScore: 5,
    gameMode: gameMode,
  });

  const arena = new Arena({
    width: arenaWidth,
    height: 2,
    depth: arenaDepth,
    walls: {
      thickness: 2,
      height: 0,
      color: "#0000dd",
    },
  });
  scene.add(arena);
  arena.buildWalls(scene);

  const ballRadius = 0.4;
  const ball = new Ball({
    radius: ballRadius,
    position: {
      x: 0,
      y: arena.height / 2 + ballRadius,
      z: 0,
    },
    gameManager: gameManager,
  });
  scene.add(ball);

  // Player 1
  const paddleHeight = 0.5;
  const paddleL = new Paddle({
    color: 0xff007f,
    height: paddleHeight,
    position: {
      x: -20,
      y: arena.height / 2 + paddleHeight,
      z: 0,
    },
    arenaDepth: arena.depth,
    gameManager: gameManager,
  });
  scene.add(paddleL);

  // Player 2
  const paddleR = new Paddle({
    color: 0x0fff50,
    height: paddleHeight,
    position: {
      x: 20,
      y: arena.height / 2 + paddleHeight,
      z: 0,
    },
    arenaDepth: arena.depth,
    gameManager: gameManager,
  });
  scene.add(paddleR);

  function animationLoop(timestamp) {
    if (gameManager.gameOver) return;
    gameManager.updateDeltaTime(timestamp);
    inputManager.handleInput();
    paddleL.update(inputManager.paddleLInputZ);
    paddleR.update(inputManager.paddleRInputZ);
    ball.update(arena, paddleL, paddleR);
    postProcessing.render();
  }

  function resetGame() {
    ball.resetGame();
    paddleL.resetGame();
    paddleR.resetGame();
    gameManager.resetGame();
  }

  function backToTournament() {
    showSection("/tournament/");
  }

  if (gameMode === "tournament") {
    const backButton = document.getElementById("back");
    backButton.addEventListener("click", backToTournament);
  } else {
    const playAgainButton = document.getElementById("play-again");
    playAgainButton.addEventListener("click", resetGame);
  }
}

window.startGame = startGame;
