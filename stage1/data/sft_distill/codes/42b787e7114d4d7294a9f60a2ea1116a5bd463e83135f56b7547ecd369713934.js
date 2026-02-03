const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
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

// 游戏状态信号
let gameState = {
  playerX: 0,
  playerY: 0,
  moveCount: 0,
  isMoving: false
};

// 12x12 地图数据：0=空地，1=墙
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE_SIZE = 50;
let player;
let cursors;
let tilemap;
let wallLayer;
let statusText;

function preload() {
  // 创建空地纹理（浅灰色）
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0x666666, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(1, 0x444444, 1);
  floorGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();

  // 创建墙壁纹理（深色）
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x333333, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.lineStyle(2, 0x000000, 1);
  wallGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();

  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.lineStyle(3, 0xffffff, 1);
  playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
}

function create() {
  // 创建 Tilemap
  tilemap = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });

  // 添加 tileset（使用生成的纹理）
  const tiles = tilemap.addTilesetImage('floor', 'floor');
  const wallTiles = tilemap.addTilesetImage('wall', 'wall');

  // 创建图层 - 先创建地板层
  const floorLayer = tilemap.createLayer(0, tiles, 0, 0);
  
  // 将所有tile设置为地板
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      floorLayer.putTileAt(0, x, y);
    }
  }

  // 创建墙壁层
  wallLayer = this.add.group();
  
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      if (mapData[y][x] === 1) {
        const wall = this.physics.add.staticSprite(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'wall'
        );
        wall.setOrigin(0.5, 0.5);
        wall.refreshBody();
        wallLayer.add(wall);
      }
    }
  }

  // 创建玩家（在第一个空地位置）
  let startX = 1, startY = 1;
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      if (mapData[y][x] === 0) {
        startX = x;
        startY = y;
        break;
      }
    }
    if (mapData[startY][startX] === 0) break;
  }

  player = this.physics.add.sprite(
    startX * TILE_SIZE + TILE_SIZE / 2,
    startY * TILE_SIZE + TILE_SIZE / 2,
    'player'
  );
  player.setOrigin(0.5, 0.5);
  player.setCollideWorldBounds(true);

  // 更新玩家状态
  gameState.playerX = startX;
  gameState.playerY = startY;

  // 设置碰撞
  this.physics.add.collider(player, wallLayer);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);

  updateStatusText();
}

function update() {
  if (!player || !cursors) return;

  const speed = 200;
  let velocityX = 0;
  let velocityY = 0;

  // 检测键盘输入
  if (cursors.left.isDown) {
    velocityX = -speed;
  } else if (cursors.right.isDown) {
    velocityX = speed;
  }

  if (cursors.up.isDown) {
    velocityY = -speed;
  } else if (cursors.down.isDown) {
    velocityY = speed;
  }

  // 设置玩家速度
  player.setVelocity(velocityX, velocityY);

  // 更新玩家位置状态
  const newX = Math.floor(player.x / TILE_SIZE);
  const newY = Math.floor(player.y / TILE_SIZE);

  if (newX !== gameState.playerX || newY !== gameState.playerY) {
    gameState.playerX = newX;
    gameState.playerY = newY;
    gameState.moveCount++;
    updateStatusText();
  }

  // 检测是否在移动
  gameState.isMoving = velocityX !== 0 || velocityY !== 0;
}

function updateStatusText() {
  statusText.setText([
    `Position: (${gameState.playerX}, ${gameState.playerY})`,
    `Moves: ${gameState.moveCount}`,
    `Moving: ${gameState.isMoving ? 'Yes' : 'No'}`
  ]);
}

// 启动游戏
new Phaser.Game(config);

// 导出状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, config };
}