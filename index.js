import * as PIXI from "pixi.js";

import Player from "./player";
import Zombie from "./zombie";
import { Howl } from "howler";
import Spawner from "./spawner";

const loader = new PIXI.Loader();

loader.add("bomb", "./bomb.png");

loader.load(() => {
  startGame(loader.resources);
});

function startGame(resources) {
  const canvasSize = 312;
  const canvas = document.getElementById("mycanvas");
  const app = new PIXI.Application({
    view: canvas,
    width: canvasSize,
    height: canvasSize,
    backgroundColor: 0x5c812f
  });

  const bgSound = new Howl({
    src: ["./MoaningBeast.mp3"],
    volume: 0.3,
    loop: true,
    onend: function () {
      bgSound.play();
    }
  });

  let player = new Player({ app });
  let zSpawner = new Spawner({
    app,
    create: () => new Zombie({ app, player })
  });
  let gameStartScene = createScene("Click to Start");
  let gameOverScene = createScene("Game Over");
  app.gameStarted = false;

  app.ticker.add((delta) => {
    gameOverScene.visible = player.dead;
    gameStartScene.visible = !app.gameStarted;
    if (app.gameStarted === false) return;
    player.update();

    zSpawner.spawns.forEach((zombie) => zombie.update());
    bulletHit({
      bombs: player.shooting.bombs,
      zombies: zSpawner.spawns,
      bulletRadius: 8,
      zombieRadius: 16
    });
  });

  function bulletHit({ bombs, zombies, zombieRadius, bulletRadius }) {
    for (let i = bombs.length - 1; i >= 0; i--) {
      const bullet = bombs[i];
      for (let j = zombies.length - 1; j >= 0; j--) {
        const zombie = zombies[j];
        let dx = zombie.position.x - bullet.position.x;
        let dy = zombie.position.y - bullet.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bulletRadius + zombieRadius) {
          zombies.splice(j, 1);
          app.stage.removeChild(bullet);
          bombs.splice(i, 1);
          zombie.kill();
          break;
        }
      }
    }
  }

  function createScene(sceneText) {
    const sceneContainer = new PIXI.Container();
    const text = new PIXI.Text(sceneText);
    text.x = app.screen.width / 2;
    text.y = 0;
    text.anchor.set(0.5, 0);
    sceneContainer.zIndex = 1;
    sceneContainer.addChild(text);
    app.stage.addChild(sceneContainer);
    return sceneContainer;
  }

  function startGame() {
    app.gameStarted = true;
    bgSound.play();
  }

  document.addEventListener("click", startGame);
}
