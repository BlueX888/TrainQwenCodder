const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
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

// 游戏状态变量（可验证）
let gameState = {
  playerX: 1,
  playerY: 1,
  moveCount: 0
};

// 15x15 地图数据：0=空地，1=墙壁
const mapData = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const TILE_SIZE = 40;
let player;
let cursors;
let tilemap;
let layer;

function preload() {
  // 使用 Graphics 创建瓦片纹理
  const graphics = this.add.graphics();
  
  // 创建空地纹理（浅灰色）
  graphics.fillStyle(0xcccccc, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(1, 0xaaaaaa, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('ground', TILE_SIZE, TILE_SIZE);
  
  // 创建墙壁纹理（深灰色）
  graphics.clear();
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(2, 0x222222, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  
  // 创建玩家纹理（蓝色圆形）
  graphics.clear();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  graphics.lineStyle(2, 0x0044cc, 1);
  graphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  graphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  
  graphics.destroy();
}

function create() {
  // 创建空白 Tilemap
  tilemap = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: 15,
    height: 15
  });
  
  // 添加瓦片集
  const tiles = tilemap.addTilesetImage('tiles', null, TILE_SIZE, TILE_SIZE);
  
  // 创建图层
  layer = tilemap.createBlankLayer('layer1', tiles, 0, 0);
  
  // 手动填充瓦片数据
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const tileIndex = mapData[y][x];
      if (tileIndex === 1) {
        // 墙壁
        const tile = layer.putTileAt(1, x, y);
        tile.setCollision(true);
      } else {
        // 空地
        layer.putTileAt(0, x, y);
      }
    }
  }
  
  // 使用 Graphics 渲染瓦片（因为 Tilemap 需要实际纹理）
  const mapGraphics = this.add.graphics();
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      if (mapData[y][x] === 1) {
        // 墙壁
        mapGraphics.fillStyle(0x333333, 1);
        mapGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        mapGraphics.lineStyle(2, 0x222222, 1);
        mapGraphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else {
        // 空地
        mapGraphics.fillStyle(0xcccccc, 1);
        mapGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        mapGraphics.lineStyle(1, 0xaaaaaa, 1);
        mapGraphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
  
  // 设置图层碰撞（所有值为1的瓦片可碰撞）
  layer.setCollisionByProperty({ collides: true });
  layer.setCollisionBetween(1, 1);
  
  // 创建玩家精灵
  player = this.physics.add.sprite(
    gameState.playerX * TILE_SIZE + TILE_SIZE / 2,
    gameState.playerY * TILE_SIZE + TILE_SIZE / 2,
    'player'
  );
  
  player.setCollideWorldBounds(true);
  player.body.setSize(TILE_SIZE - 8, TILE_SIZE - 8);
  
  // 添加玩家与图层的碰撞
  this.physics.add.collider(player, layer);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  }).setScrollFactor(0).setDepth(100);
  
  // 状态文本（可验证）
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  }).setScrollFactor(0).setDepth(100);
  
  updateStatusText.call(this);
}

function update() {
  const speed = 160;
  
  // 重置速度
  player.setVelocity(0);
  
  // 处理方向键输入
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 更新游戏状态
  const newX = Math.floor(player.x / TILE_SIZE);
  const newY = Math.floor(player.y / TILE_SIZE);
  
  if (newX !== gameState.playerX || newY !== gameState.playerY) {
    gameState.playerX = newX;
    gameState.playerY = newY;
    gameState.moveCount++;
    updateStatusText.call(this);
  }
}

function updateStatusText() {
  this.statusText.setText(
    `Position: (${gameState.playerX}, ${gameState.playerY}) | Moves: ${gameState.moveCount}`
  );
}

// 启动游戏
new Phaser.Game(config);