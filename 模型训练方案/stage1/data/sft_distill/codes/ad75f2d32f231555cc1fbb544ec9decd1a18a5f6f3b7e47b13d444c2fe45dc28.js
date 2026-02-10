const config = {
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  backgroundColor: '#2d2d2d',
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

// 可验证的状态信号
let gameState = {
  playerX: 1,
  playerY: 1,
  moveCount: 0,
  collisionCount: 0
};

let player;
let cursors;
let tilemapLayer;
let tileSize = 64;

// 8x8 地图数据：0=空地，1=墙
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 1. 创建墙体纹理
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x8B4513, 1);
  wallGraphics.fillRect(0, 0, tileSize, tileSize);
  wallGraphics.lineStyle(2, 0x654321, 1);
  wallGraphics.strokeRect(0, 0, tileSize, tileSize);
  wallGraphics.generateTexture('wall', tileSize, tileSize);
  wallGraphics.destroy();

  // 2. 创建地板纹理
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0xCCCCCC, 1);
  floorGraphics.fillRect(0, 0, tileSize, tileSize);
  floorGraphics.lineStyle(1, 0x999999, 0.3);
  floorGraphics.strokeRect(0, 0, tileSize, tileSize);
  floorGraphics.generateTexture('floor', tileSize, tileSize);
  floorGraphics.destroy();

  // 3. 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00FF00, 1);
  playerGraphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
  playerGraphics.lineStyle(3, 0x00AA00, 1);
  playerGraphics.strokeCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
  playerGraphics.generateTexture('player', tileSize, tileSize);
  playerGraphics.destroy();

  // 4. 创建 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: tileSize,
    tileHeight: tileSize
  });

  // 5. 添加 Tileset（使用生成的纹理）
  const tiles = map.addTilesetImage('floor', null, tileSize, tileSize, 0, 0);
  
  // 6. 创建图层
  tilemapLayer = map.createLayer(0, tiles, 0, 0);

  // 7. 手动渲染地图（因为 addTilesetImage 的限制）
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      const tileType = mapData[y][x];
      const texture = tileType === 1 ? 'wall' : 'floor';
      this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, texture);
    }
  }

  // 8. 设置碰撞（tile index 1 为墙）
  tilemapLayer.setCollisionByProperty({ collides: true });
  tilemapLayer.setCollision(1);

  // 9. 创建玩家精灵
  player = this.physics.add.sprite(
    gameState.playerX * tileSize + tileSize / 2,
    gameState.playerY * tileSize + tileSize / 2,
    'player'
  );
  player.setCollideWorldBounds(true);
  player.body.setSize(tileSize - 10, tileSize - 10);

  // 10. 设置玩家与 Tilemap 碰撞
  this.physics.add.collider(player, tilemapLayer, () => {
    gameState.collisionCount++;
  });

  // 11. 创建方向键
  cursors = this.input.keyboard.createCursorKeys();

  // 12. 添加状态显示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  }).setScrollFactor(0).setDepth(100);

  const statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  }).setScrollFactor(0).setDepth(100);

  // 13. 更新状态显示
  this.events.on('postupdate', () => {
    gameState.playerX = Math.floor(player.x / tileSize);
    gameState.playerY = Math.floor(player.y / tileSize);
    statusText.setText(
      `Position: (${gameState.playerX}, ${gameState.playerY})\n` +
      `Moves: ${gameState.moveCount}\n` +
      `Collisions: ${gameState.collisionCount}`
    );
  });
}

function update() {
  const speed = 200;

  // 重置速度
  player.setVelocity(0);

  // 方向键控制
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    if (Math.abs(player.body.velocity.x) > 0) {
      gameState.moveCount++;
    }
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    if (Math.abs(player.body.velocity.x) > 0) {
      gameState.moveCount++;
    }
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    if (Math.abs(player.body.velocity.y) > 0) {
      gameState.moveCount++;
    }
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    if (Math.abs(player.body.velocity.y) > 0) {
      gameState.moveCount++;
    }
  }

  // 归一化对角线移动速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(speed);
  }
}

// 启动游戏
new Phaser.Game(config);

// 导出状态供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, config };
}