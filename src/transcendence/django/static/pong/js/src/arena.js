import * as THREE from "../three/three.module.js";

export default class Arena extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    walls = {
      thickness: 2,
      height: 2,
      color: "#0000dd",
    },
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({
        color: "#0d1930",
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color(0x0d1930),
        flatShading: true,
      })
    );

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.bottomSide = this.position.z + this.depth / 2;
    this.topSide = this.position.z - this.depth / 2;
    this.rightSide = this.position.x + this.width / 2;
    this.leftSide = this.position.x - this.width / 2;

    this.walls = walls;

    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: this.walls.color,
    });
  }

  buildWalls(scene) {
    this.buildVerticalWall(scene, this.rightSide + this.walls.thickness / 2);
    this.buildVerticalWall(scene, this.leftSide - this.walls.thickness / 2);
    this.buildHorizontalWall(scene, this.topSide - this.walls.thickness / 2);
    this.buildHorizontalWall(scene, this.bottomSide + this.walls.thickness / 2);
  }

  buildVerticalWall(scene, positionX) {
    const wallGeometry = new THREE.BoxGeometry(
      this.walls.thickness,
      this.walls.height + this.height,
      this.depth
    );
    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    wall.position.set(positionX, this.position.y + this.height, 0);
    scene.add(wall);
  }

  buildHorizontalWall(scene, positionZ) {
    const wallGeometry = new THREE.BoxGeometry(
      // The horizontal walls are larger so it can fill the gaps
      this.width + this.walls.thickness * 2,
      this.walls.height + this.height,
      this.walls.thickness
    );
    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    wall.position.set(0, this.position.y + this.height, positionZ);
    scene.add(wall);
  }
}
