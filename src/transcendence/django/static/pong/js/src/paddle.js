import * as THREE from "../three/three.module.js";

export default class Paddle extends THREE.Mesh {
  constructor({
    width = 0.5,
    height = 0.5,
    depth = 3.5,
    color = "#ffffff",
    speed = 0.6,
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    arenaDepth,
    gameManager,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshBasicMaterial({ color }),
    );

    this.gameManager = gameManager;

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.updateCollisionPoints();

    this.speed = speed;
    this.velocity = 0;

    this.wallDistanceFromCenter = Math.abs(arenaDepth / 2);

    this.canCollideWithBall = true;

    this.startPosX = position.x;
  }

  update(paddleInputZ) {
    this.velocity = paddleInputZ * this.speed * this.gameManager.deltaTime;
    this.updateCollisionPoints();
    if (this.checkCollision() == false) this.position.z += this.velocity;
  }

  updateCollisionPoints() {
    this.bottomSide = this.position.z + this.depth / 2;
    this.topSide = this.position.z - this.depth / 2;
    this.rightSide = this.position.x + this.width / 2;
    this.leftSide = this.position.x - this.width / 2;
  }

  checkCollision() {
    const playerCollisionDelta =
      Math.abs(this.position.z + this.velocity) + Math.abs(this.depth / 2);
    if (playerCollisionDelta < this.wallDistanceFromCenter) return false;
    return true;
  }

  resetGame() {
    this.position.x = this.startPosX;
    this.position.z = 0;
    this.canCollideWithBall = true;
  }
}
