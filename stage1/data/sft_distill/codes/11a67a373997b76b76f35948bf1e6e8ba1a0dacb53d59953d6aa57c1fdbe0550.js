const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  tileX: 0,
  tileY: 0,
  canMoveUp: true,
  canMoveDown: true,
  canMoveLeft: true,
  canMoveRight: true,
  totalMoves: 0,
  collisionCount: 0
};

// 5x5地图数据：0=空地，1=墙
const mapData = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
];

const TILE_SIZE = 80;
let player;
let cursors;
let map;
let layer;
let playerSpeed = 200;

function preload() {
  // 使用Graphics生成纹理，无需外部资源
}

function create() {
  // 1. 创建瓦片纹理
  createTileTextures.call(this);
  
  // 2. 创建Tilemap
  map = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });
  
  // 3. 添加瓦片集
  const tiles = map.addTilesetImage('tiles', null, TILE_SIZE, TILE_SIZE);
  
  // 4. 创建图层
  layer = map.createLayer(0, tiles, 0, 0);
  
  // 5. 设置碰撞：所有索引为1的瓦片可碰撞
  map.setCollision(1);
  
  // 6. 创建玩家
  player = this.physics.add.sprite(
    TILE_SIZE * 1.5,  // 起始位置在(1,1)瓦片中心
    TILE_SIZE * 1.5,
    'player'
  );
  player.setCollideWorldBounds(true);
  
  // 7. 设置玩家与瓦片图层的碰撞
  this.physics.add.collider(player, layer, onCollision, null, this);
  
  // 8. 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 9. 添加WASD键支持
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 初始化信号
  updateSignals();
  
  console.log('Game initialized:', JSON.stringify(window.__signals__));
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  let moved = false;
  
  // 处理输入
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-playerSpeed);
    moved = true;
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(playerSpeed);
    moved = true;
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-playerSpeed);
    moved = true;
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(playerSpeed);
    moved = true;
  }
  
  // 如果移动了，增加移动计数
  if (moved && (player.body.velocity.x !== 0 || player.body.velocity.y !== 0)) {
    window.__signals__.totalMoves++;
  }
  
  // 更新信号
  updateSignals();
}

function createTileTextures() {
  // 创建空地纹理（浅灰色）
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0xcccccc, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(2, 0x999999, 1);
  floorGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.generateTexture('tile_0', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();
  
  // 创建墙纹理（深灰色）
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x333333, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.lineStyle(3, 0x000000, 1);
  wallGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.generateTexture('tile_1', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();
  
  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.lineStyle(3, 0x0044aa, 1);
  playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
  
  // 手动设置瓦片纹理映射
  this.textures.addSpriteSheet('tiles', this.textures.get('tile_0').getSourceImage(), {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE
  });
  
  // 为每个瓦片类型设置纹理
  this.textures.get('tiles').add(0, 0, 0, 0, TILE_SIZE, TILE_SIZE);
  
  const wallCanvas = this.textures.createCanvas('tilesCanvas', TILE_SIZE * 2, TILE_SIZE);
  wallCanvas.draw(0, 0, 'tile_0');
  wallCanvas.draw(TILE_SIZE, 0, 'tile_1');
  wallCanvas.update();
  
  this.textures.addSpriteSheet('tiles', wallCanvas.canvas, {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE
  });
}

function onCollision(player, tile) {
  // 碰撞回调
  window.__signals__.collisionCount++;
  console.log('Collision detected at tile:', tile.x, tile.y);
}

function updateSignals() {
  // 更新玩家位置信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  
  // 计算玩家所在瓦片坐标
  window.__signals__.tileX = Math.floor(player.x / TILE_SIZE);
  window.__signals__.tileY = Math.floor(player.y / TILE_SIZE);
  
  // 检测四个方向是否可移动
  const tileX = window.__signals__.tileX;
  const tileY = window.__signals__.tileY;
  
  window.__signals__.canMoveUp = tileY > 0 && mapData[tileY - 1][tileX] === 0;
  window.__signals__.canMoveDown = tileY < 4 && mapData[tileY + 1][tileX] === 0;
  window.__signals__.canMoveLeft = tileX > 0 && mapData[tileY][tileX - 1] === 0;
  window.__signals__.canMoveRight = tileX < 4 && mapData[tileY][tileX + 1] === 0;
  
  // 每60帧输出一次日志
  if (this.game.loop.frame % 60 === 0) {
    console.log('Signals:', JSON.stringify(window.__signals__));
  }
}

new Phaser.Game(config);