import * as THREE from "../three/three.module.js";

export default class Ball extends THREE.Mesh {
  constructor({
    radius = 2,

    colors = {
      slow: 0xffff99,
      normal: 0xffff00,
      fast: 0xff5733,
    },

    speed = 0.8,
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    gameManager,
  }) {
    super(
      new THREE.SphereGeometry(radius),
      new THREE.MeshBasicMaterial({ color: colors.slow }),
    );

    this.radius = radius;

    this.position.set(position.x, position.y, position.z);

    if (gameManager.difficulty === "slow") {
      this.speed = speed * 0.5;
    } else if (gameManager.difficulty === "normal") {
      this.speed = speed;
    } else if (gameManager.difficulty === "fast") {
      this.speed = speed * 1.5;
    }

    this.speed = speed;
    this.startSpeed = speed * 0.5;
    this.fastSpeed = speed * 1.35;

    this.velocity = {
      x: this.startSpeed,
      y: 0,
      z: 0,
    };

    this.colors = colors;

    this.startSide = "L";

    this.gameManager = gameManager;
  }

  update(arena, paddleL, paddleR) {
    const nextPos = {
      x: this.position.x + this.velocity.x * this.gameManager.deltaTime,
      z: this.position.z + this.velocity.z * this.gameManager.deltaTime,
    };
    if (this.checkGoal(arena, nextPos)) {
      paddleL.canCollideWithBall = true;
      paddleR.canCollideWithBall = true;
      return;
    }
    if (this.checkWallHCollision(arena, nextPos)) {
      this.velocity.z *= -1;
    } else if (this.checkPaddleColision(paddleL, nextPos)) {
      paddleL.canCollideWithBall = false;
      paddleR.canCollideWithBall = true;
      this.updateVelocity(nextPos.z, paddleL);
    } else if (this.checkPaddleColision(paddleR, nextPos)) {
      paddleR.canCollideWithBall = false;
      paddleL.canCollideWithBall = true;
      this.updateVelocity(nextPos.z, paddleR);
    }
    this.position.x += this.velocity.x * this.gameManager.deltaTime;
    this.position.z += this.velocity.z * this.gameManager.deltaTime;
  }

  checkWallHCollision(arena, nextPos) {
    if (nextPos.z - this.radius <= arena.topSide) {
      return true;
    } else if (nextPos.z + this.radius >= arena.bottomSide) return true;
    return false;
  }

  checkGoal(arena, nextPos) {
    if (nextPos.x + this.radius >= arena.rightSide) {
      this.gameManager.increaseLScore();
      this.resetRound();
      return true;
    } else if (nextPos.x - this.radius <= arena.leftSide) {
      this.gameManager.increaseRScore();
      this.resetRound();
      return true;
    }
    return false;
  }

  checkPaddleColision(paddle, nextPos) {
    if (paddle.canCollideWithBall == false) return false;
    else if (
      nextPos.x + this.radius >= paddle.leftSide &&
      nextPos.x - this.radius <= paddle.rightSide
    ) {
      if (
        nextPos.z - this.radius <= paddle.bottomSide &&
        nextPos.z + this.radius >= paddle.topSide
      ) {
        return true;
      }
    }
    return false;
  }

  updateVelocity(intersectZ, paddle) {
    const relativeDelta = intersectZ - paddle.position.z;
    const normalizedDelta = relativeDelta / (paddle.depth / 2);
    const maxBounceAngle = Math.PI / 4;
    const bounceAngle = normalizedDelta * maxBounceAngle;
    const currentSpeed = this.checkPaddleSideCollision(paddle)
      ? this.fastSpeed
      : this.speed;
    this.velocity.x =
      Math.sign(this.velocity.x) * -Math.cos(bounceAngle) * currentSpeed;
    this.velocity.z = Math.sin(bounceAngle) * currentSpeed;
  }

  checkPaddleSideCollision(paddle) {
    if (
      this.position.z <= paddle.topSide ||
      this.position.z >= paddle.bottomSide
    ) {
      this.material.color.setHex(this.colors.fast);
      return true;
    } else {
      this.material.color.setHex(this.colors.normal);
      return false;
    }
  }

  resetRound() {
    this.position.x = 0;
    this.position.z = 0;
    this.material.color.setHex(this.colors.slow);
    if (this.startSide === "L") {
      this.velocity.z = 0;
      this.velocity.x = -this.startSpeed;
      this.startSide = "R";
    } else if (this.startSide === "R") {
      this.velocity.z = 0;
      this.velocity.x = this.startSpeed;
      this.startSide = "L";
    }
  }

  resetGame() {
    this.position.x = 0;
    this.position.z = 0;
    this.material.color.setHex(this.colors.slow);
    this.startSide = "L";
    this.velocity.x = -this.startSpeed;
    this.velocity.z = 0;
  }
}
