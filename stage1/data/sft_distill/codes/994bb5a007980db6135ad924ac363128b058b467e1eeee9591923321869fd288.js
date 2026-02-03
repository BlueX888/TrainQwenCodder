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

// 可验证的游戏状态
let gameState = {
  playerX: 0,
  playerY: 0,
  moveCount: 0
};

// 12x12 地图数据：0=空地，1=墙壁
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE_SIZE = 50;
let player;
let cursors;
let map;
let layer;
let playerSpeed = 200;

function preload() {
  // 使用 Graphics 创建瓦片纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 创建空地瓦片（浅灰色）
  graphics.fillStyle(0xcccccc, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(1, 0x999999, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('ground', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 创建墙壁瓦片（深灰色）
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(2, 0x000000, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 创建玩家纹理（蓝色圆形）
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  graphics.lineStyle(2, 0x000088, 1);
  graphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  graphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  graphics.destroy();
}

function create() {
  // 创建 Tilemap
  map = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: 12,
    height: 12
  });
  
  // 添加瓦片集
  const groundTiles = map.addTilesetImage('ground');
  const wallTiles = map.addTilesetImage('wall');
  
  // 创建图层
  layer = map.createBlankLayer('layer1', [groundTiles, wallTiles]);
  
  // 填充地图数据
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      if (mapData[y][x] === 0) {
        // 空地使用 ground 纹理（索引0）
        layer.putTileAt(0, x, y);
      } else {
        // 墙壁使用 wall 纹理（索引1）
        layer.putTileAt(1, x, y);
      }
    }
  }
  
  // 设置墙壁瓦片的碰撞（索引1为墙壁）
  layer.setCollisionByProperty({ collides: true });
  layer.setCollision(1);
  
  // 创建玩家（初始位置在左上角的空地）
  player = this.physics.add.sprite(
    1.5 * TILE_SIZE,
    1.5 * TILE_SIZE,
    'player'
  );
  
  // 设置玩家物理属性
  player.setCollideWorldBounds(true);
  player.body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
  
  // 配置玩家与地图的碰撞
  this.physics.add.collider(player, layer);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加状态显示文本
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  this.statusText.setScrollFactor(0);
  this.statusText.setDepth(100);
  
  // 初始化游戏状态
  updateGameState();
}

function update() {
  // 重置玩家速度
  player.setVelocity(0);
  
  // 方向键控制
  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  }
  
  // 更新游戏状态
  updateGameState();
  
  // 更新状态显示
  this.statusText.setText([
    `Position: (${gameState.playerX}, ${gameState.playerY})`,
    `Moves: ${gameState.moveCount}`,
    `Use Arrow Keys to Move`
  ]);
}

function updateGameState() {
  const oldX = gameState.playerX;
  const oldY = gameState.playerY;
  
  // 更新玩家位置（转换为瓦片坐标）
  gameState.playerX = Math.floor(player.x / TILE_SIZE);
  gameState.playerY = Math.floor(player.y / TILE_SIZE);
  
  // 检测是否移动到新瓦片
  if (oldX !== gameState.playerX || oldY !== gameState.playerY) {
    gameState.moveCount++;
  }
}

// 启动游戏
new Phaser.Game(config);