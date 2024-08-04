export default class InputManager {
  constructor() {
    this.keys = {
      leftUp: {
        code: 'KeyW',
        pressed: false,
      },
      leftDown: {
        code: 'KeyS',
        pressed: false,
      },
      rightUp: {
        code: 'KeyI',
        pressed: false,
      },
      rightDown: {
        code: 'KeyK',
        pressed: false,
      },
    };
    this.paddleLInputZ = 0;
    this.paddleRInputZ = 0;

    this.setupKeyListeners();
    this.setupTouchListeners();
  }

  setupKeyListeners() {
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case this.keys.leftUp.code:
          this.keys.leftUp.pressed = true;
          break;
        case this.keys.leftDown.code:
          this.keys.leftDown.pressed = true;
          break;
        case this.keys.rightUp.code:
          this.keys.rightUp.pressed = true;
          break;
        case this.keys.rightDown.code:
          this.keys.rightDown.pressed = true;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.code) {
        case this.keys.leftUp.code:
          this.keys.leftUp.pressed = false;
          break;
        case this.keys.leftDown.code:
          this.keys.leftDown.pressed = false;
          break;
        case this.keys.rightUp.code:
          this.keys.rightUp.pressed = false;
          break;
        case this.keys.rightDown.code:
          this.keys.rightDown.pressed = false;
          break;
      }
    });
  }

  setupTouchListeners() {
    document.getElementById('left-up').addEventListener('touchstart', () => {
      this.keys.leftUp.pressed = true;
    });

    document.getElementById('left-up').addEventListener('touchend', () => {
      this.keys.leftUp.pressed = false;
    });

    document.getElementById('left-down').addEventListener('touchstart', () => {
      this.keys.leftDown.pressed = true;
    });

    document.getElementById('left-down').addEventListener('touchend', () => {
      this.keys.leftDown.pressed = false;
    });

    document.getElementById('right-up').addEventListener('touchstart', () => {
      this.keys.rightUp.pressed = true;
    });

    document.getElementById('right-up').addEventListener('touchend', () => {
      this.keys.rightUp.pressed = false;
    });

    document.getElementById('right-down').addEventListener('touchstart', () => {
      this.keys.rightDown.pressed = true;
    });

    document.getElementById('right-down').addEventListener('touchend', () => {
      this.keys.rightDown.pressed = false;
    });
  }

  handleInput() {
    this.paddleLInputZ = 0;
    this.paddleRInputZ = 0;

    if (this.keys.leftUp.pressed) this.paddleLInputZ = -1;
    else if (this.keys.leftDown.pressed) this.paddleLInputZ = 1;

    if (this.keys.rightUp.pressed) this.paddleRInputZ = -1;
    else if (this.keys.rightDown.pressed) this.paddleRInputZ = 1;
  }
}
