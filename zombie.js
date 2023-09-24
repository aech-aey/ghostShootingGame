import * as PIXI from "pixi.js";
import Victor from "victor";
import { Howl } from "howler";

export default class Zombie {
  constructor({ app, player }) {
    this.app = app;
    this.player = player;
    this.speed = 2;
    this.attacking = false;

    this.zombie = new PIXI.Container();

    const zombieCircle = new PIXI.Graphics();
    zombieCircle.beginFill(0xffffff);
    zombieCircle.drawCircle(0, 0, 0);
    zombieCircle.endFill();

    const ghostTexture = PIXI.Texture.from("ghost.png");
    const ghostFrames = [];
    const frameWidth = 48;
    const frameHeight = 64;
    const framesPerRow = 3;
    const numFrames = 12;

    for (let i = 0; i < numFrames; i++) {
      const frameX = (i % framesPerRow) * frameWidth;
      const frameY = Math.floor(i / framesPerRow) * frameHeight;
      const frame = new PIXI.Texture(
        ghostTexture,
        new PIXI.Rectangle(frameX, frameY, frameWidth, frameHeight)
      );
      ghostFrames.push(frame);
    }

    const [spawnPosition, edge] = this.randomZombiePos();
    this.zombie.position.set(spawnPosition.x, spawnPosition.y);

    let startingIndex;

    switch (edge) {
      case 0:
        startingIndex = 6;
        break;
      case 1:
        startingIndex = 9;
        break;
      case 2:
        startingIndex = 0;
        break;
      case 3:
        startingIndex = 3;
        break;
      default:
        startingIndex = 0;
        break;
    }

    this.ghostSprite = new PIXI.AnimatedSprite(ghostFrames);
    this.ghostSprite.animationSpeed = 0.1;
    this.ghostSprite.loop = true;
    this.ghostSprite.anchor.set(0.5);

    this.ghostSprite.gotoAndStop(startingIndex);
    this.zombie.addChild(zombieCircle);
    this.zombie.addChild(this.ghostSprite);

    app.stage.addChild(this.zombie);

    this.explosionTextures = [];
    const frameWidthExp = 64;
    const frameHeightExp = 64;
    const numFramesExp = 16;
    const framesPerRowExp = 4;
    const textureExp = PIXI.Texture.from("exp.png");

    for (let i = 0; i < numFramesExp; i++) {
      const frameX = (i % framesPerRowExp) * frameWidthExp;
      const frameY = Math.floor(i / framesPerRowExp) * frameHeightExp;
      const frame = new PIXI.Texture(
        textureExp,
        new PIXI.Rectangle(frameX, frameY, frameWidthExp, frameHeightExp)
      );
      this.explosionTextures.push(frame);
    }

    this.explosion = new PIXI.AnimatedSprite(this.explosionTextures);
    this.explosion.visible = false;
    this.explosion.animationSpeed = 0.1;
    this.explosion.loop = false;
    this.explosion.anchor.set(0.5);
    app.stage.addChild(this.explosion);
    this.explosionSound = new Howl({
      src: ["./DeathFlash.flac"]
    });
    this.playerPainBomb = new Howl({
      src: ["./pain4.wav"]
    });
  }

  update() {
    let z = new Victor(this.zombie.position.x, this.zombie.position.y);
    let s = new Victor(this.player.position.x, this.player.position.y);
    if (z.distance(s) < this.player.width / 2) {
      if (!this.attacking) {
        // this.attackPlayer();
        this.player.attack();
        this.player.isUnderAttack = true;
      }
      return;
    }
    let d = s.subtract(z);
    let v = d.normalize().multiplyScalar(this.speed);
    this.zombie.position.set(
      this.zombie.position.x + v.x,
      this.zombie.position.y + v.y
    );
  }

  kill() {
    const zombiePosition = this.zombie.position.clone();
    this.app.stage.removeChild(this.zombie);
    clearInterval(this.interval);
    this.explosion.visible = true;
    this.explosion.position.x = zombiePosition.x;
    this.explosion.position.y = zombiePosition.y;

    this.explosionSound.play();
    let e = new Victor(this.explosion.position.x, this.explosion.position.y);
    let s = new Victor(this.player.position.x, this.player.position.y);
    if (e.distance(s) < this.player.width / 2) {
      this.player.health -= 10;
      this.playerPainBomb.play();
    }
    this.explosion.gotoAndPlay(0);
  }

  get position() {
    return this.zombie.position;
  }

  randomZombiePos() {
    let edge = Math.floor(Math.random() * 4);
    let canvasSize = this.app.screen.width;
    let zombieSpawn = new Victor(0, 0);
    switch (edge) {
      case 0:
        zombieSpawn.x = canvasSize * Math.random();
        break;
      case 1:
        zombieSpawn.x = canvasSize;
        zombieSpawn.y = canvasSize * Math.random();
        break;
      case 2:
        zombieSpawn.x = canvasSize * Math.random();
        zombieSpawn.y = canvasSize;
        break;
      case 3:
        zombieSpawn.x = 0;
        zombieSpawn.y = canvasSize * Math.random();
        break;
      default:
        break;
    }
    return [zombieSpawn, edge];
  }

  // attackPlayer() {
  //   if (this.attacking) return;
  //   this.attacking = true;
  //   this.interval = setInterval(() => {
  //     this.player.attack();
  //   }, 500);
  // }
}
