import * as PIXI from "pixi.js";
import Shooting from "./shooting";
import { Howl } from "howler";
export default class Player {
  constructor({ app }) {
    this.app = app;
    const playerWidth = 32;
    const playerHeight = 32;
    const frameWidth = 16;
    const frameHeight = 18;
    const numFrames = 12;
    const framesPerRow = 3;
    const texture = PIXI.Texture.from("./spriteSheet.png");

    const playerTextures = [];
    for (let i = 0; i < numFrames; i++) {
      const frameX = (i % framesPerRow) * frameWidth;
      const frameY = Math.floor(i / framesPerRow) * frameHeight;
      const frame = new PIXI.Texture(
        texture,
        new PIXI.Rectangle(frameX, frameY, frameWidth, frameHeight)
      );
      playerTextures.push(frame);
    }

    this.playerTextures = playerTextures;
    this.player = new PIXI.AnimatedSprite(this.playerTextures);
    this.player.animationSpeed = 0.5;
    this.player.anchor.set(0.5);
    this.player.position.set(app.screen.width / 2, app.screen.height / 2);
    this.player.width = playerWidth;
    this.player.height = playerHeight;
    this.playerPain = new Howl({
      src: ["./pain1.wav"]
    });

    this.playerDeath = new Howl({
      src: ["./die1.wav"]
    });
    this.currentRow = 1;
    this.currentFrame = 0;

    this.player.texture = this.playerTextures[
      this.currentRow * framesPerRow + this.currentFrame
    ];

    app.stage.addChild(this.player);
    this.lastMouseButton = 0;
    this.shooting = new Shooting({ app, player: this });

    this.maxHealth = 100;
    this.health = this.maxHealth;
    const margin = 16;
    const barHeight = 8;
    this.healthBar = new PIXI.Graphics();
    this.healthBar.beginFill(0xff0000);
    this.healthBar.initialWidth = app.screen.width - 2 * margin;
    this.healthBar.drawRect(
      margin,
      app.screen.height - barHeight - margin / 2,
      this.healthBar.initialWidth,
      barHeight
    );
    this.healthBar.endFill();
    this.healthBar.zIndex = 1;
    this.app.stage.sortableChildren = true;
    this.app.stage.addChild(this.healthBar);

    this.keys = [];

    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);

    this.isUnderAttack = false;
  }

  attack() {
    if (!this.isUnderAttack) {
      this.isUnderAttack = true;
      this.health -= 3;

      this.healthBar.width =
        (this.health / this.maxHealth) * this.healthBar.initialWidth;
      if (this.health <= 0) {
        if (!this.dead) {
          this.dead = true;
          this.playerDeath.play();
        }
      } else {
        this.playerPain.play();
      }

      this.stopMovementDuringAttack();

      setTimeout(() => {
        this.isUnderAttack = false;
        this.resumeMovementAfterAttack();
      }, 1000);
    }
  }

  stopMovementDuringAttack() {
    this.keys = [];
  }

  resumeMovementAfterAttack() {
    this.keys = [];

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
  }

  get width() {
    return this.player.width;
  }

  get position() {
    return this.player.position;
  }

  keyDown(event) {
    this.keys[event.keyCode] = true;

    if (event.keyCode === 87) {
      this.currentRow = 1;
    } else if (event.keyCode === 68) {
      this.currentRow = 3;
    } else if (event.keyCode === 83) {
      this.currentRow = 0;
    } else if (event.keyCode === 65) {
      this.currentRow = 2;
    }
  }

  keyUp(event) {
    this.keys[event.keyCode] = false;
  }

  movePlayer() {
    if (!this.isUnderAttack) {
      const playerSpeed = 3;
      let newX = this.player.position.x;
      let newY = this.player.position.y;

      if (this.keys[87]) {
        newY -= playerSpeed;
      }

      if (this.keys[83]) {
        newY += playerSpeed;
      }

      if (this.keys[65]) {
        newX -= playerSpeed;
      }

      if (this.keys[68]) {
        newX += playerSpeed;
      }

      const playerRadius = this.player.width / 2;

      newX = Math.max(
        playerRadius,
        Math.min(this.app.screen.width - playerRadius, newX)
      );
      newY = Math.max(
        playerRadius,
        Math.min(this.app.screen.height - playerRadius, newY)
      );

      this.player.position.set(newX, newY);

      if (this.keys[87]) {
        this.currentFrame++;
      } else if (this.keys[83]) {
        this.currentFrame++;
      } else if (this.keys[65]) {
        this.currentFrame++;
      } else if (this.keys[68]) {
        this.currentFrame++;
      }

      const framesPerRow = 3;

      this.currentFrame %= framesPerRow;

      this.player.texture = this.playerTextures[
        this.currentRow * framesPerRow + this.currentFrame
      ];
    }
  }

  update() {
    if (this.dead) return;

    const mouse = this.app.renderer.plugins.interaction.mouse;

    if (mouse.buttons !== this.lastMouseButton) {
      this.shooting.shoot = mouse.buttons !== 0;
      this.lastMouseButton = mouse.buttons;
    }

    this.movePlayer();

    this.shooting.update();
  }
}
