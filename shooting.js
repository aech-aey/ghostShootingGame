import * as PIXI from "pixi.js";
import Victor from "victor";

export default class Shooting {
  constructor({ app, player }) {
    this.app = app;
    this.player = player;
    this.bombSpeed = 4;
    this.maxBombs = 3;
    this.bombSize = 16;
    this.bombs = [];
  }

  fire() {
    if (this.bombs.length > this.maxBombs) {
      let bomb = this.bombs.shift();
      this.app.stage.removeChild(bomb);
    }

    this.bombs = this.bombs.filter(
      (bomb) =>
        Math.abs(bomb.position.x) < this.app.screen.width &&
        Math.abs(bomb.position.y) < this.app.screen.height
    );

    const bomb = new PIXI.Sprite(PIXI.Texture.from("./bomb.png"));
    bomb.position.set(this.player.position.x, this.player.position.y);
    bomb.scale.set(this.bombSize / bomb.width);
    bomb.anchor.set(0.5);

    const cursorPosition = this.app.renderer.plugins.interaction.mouse.global;
    const direction = new Victor(
      cursorPosition.x - this.player.position.x,
      cursorPosition.y - this.player.position.y
    ).normalize();
    bomb.velocity = direction.clone().multiplyScalar(this.bombSpeed);
    this.bombs.push(bomb);
    this.app.stage.addChild(bomb);
  }

  set shoot(shooting) {
    if (shooting) {
      this.fire();
      this.interval = setInterval(() => {
        this.fire();
      }, 500);
    } else {
      clearInterval(this.interval);
    }
  }

  update() {
    this.bombs.forEach((bomb) => {
      bomb.position.set(
        bomb.position.x + bomb.velocity.x,
        bomb.position.y + bomb.velocity.y
      );
    });
  }
}
