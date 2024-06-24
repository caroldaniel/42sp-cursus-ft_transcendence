import * as THREE from "../three/three.module.js";
import { EffectComposer } from "../three/addons/EffectComposer.js";
import { RenderPass } from "../three/addons/RenderPass.js";
import { UnrealBloomPass } from "../three/addons/UnrealBloomPass.js";
import { OutputPass } from "../three/addons/OutputPass.js";

export default class PostProcessing {
  constructor({ scene, camera, renderer, gameWidth, gameHeight }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.composer = new EffectComposer(this.renderer);
  }

  setup() {
    const renderScene = new RenderPass(this.scene, this.camera);

    const bloomResolution = new THREE.Vector2(this.gameWidth, this.gameHeight);

    const bloomPass = new UnrealBloomPass(bloomResolution, 0.5, 0.5, 0.1);
    const outputPass = new OutputPass(THREE.ReinhardToneMapping);

    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
    this.composer.addPass(outputPass);

    window.addEventListener("resize", (_) => {
      this.camera.aspect = this.gameWidth / this.gameHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.gameWidth, this.gameHeight);
      this.composer.setSize(this.gameWidth, this.gameHeight);
    });
  }

  render() {
    this.composer.render(this.scene, this.camera);
  }
}
