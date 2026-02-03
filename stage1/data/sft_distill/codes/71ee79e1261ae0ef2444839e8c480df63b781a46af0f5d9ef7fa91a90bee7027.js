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

// 游戏状态变量
let player;
let cursors;
let map;
let layer;
let playerX = 1; // 玩家在地图数组中的X坐标
let playerY = 1; // 玩家在地图数组中的Y坐标
let moveTimer = 0; // 移动冷却计时器
const MOVE_DELAY = 200; // 移动延迟（毫秒）
const TILE_SIZE = 64; // 瓦片大小

// 8x8地图数据：0=空地，1=墙壁
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

function preload() {
  // 创建空地瓦片纹理
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0x8B7355, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(2, 0x654321, 1);
  floorGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();

  // 创建墙壁瓦片纹理
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x4A4A4A, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.fillStyle(0x333333, 1);
  wallGraphics.fillRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
  wallGraphics.lineStyle(2, 0x222222, 1);
  wallGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00FF00, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 8);
  playerGraphics.lineStyle(3, 0x00AA00, 1);
  playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 8);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
}

function create() {
  // 创建Tilemap
  map = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: 8,
    height: 8
  });

  // 添加瓦片集
  const tiles = map.addTilesetImage('tiles', null, TILE_SIZE, TILE_SIZE, 0, 0);
  
  // 手动设置瓦片集纹理
  map.tilesets[0].setImage(this.textures.get('floor'));

  // 创建图层
  layer = map.createBlankLayer('layer1', tiles, 0, 0);

  // 填充地图数据
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const tileIndex = mapData[y][x];
      if (tileIndex === 0) {
        // 空地
        const tile = layer.putTileAt(0, x, y);
        if (tile) {
          tile.setTexture('floor');
        }
      } else if (tileIndex === 1) {
        // 墙壁
        const tile = layer.putTileAt(1, x, y);
        if (tile) {
          tile.setTexture('wall');
          tile.setCollision(true); // 设置碰撞
        }
      }
    }
  }

  // 设置图层碰撞（所有索引为1的瓦片可碰撞）
  layer.setCollisionByProperty({ collides: true });
  layer.setCollision(1);

  // 创建玩家
  player = this.physics.add.sprite(
    playerX * TILE_SIZE + TILE_SIZE / 2,
    playerY * TILE_SIZE + TILE_SIZE / 2,
    'player'
  );
  player.setCollideWorldBounds(true);
  player.body.setSize(TILE_SIZE - 16, TILE_SIZE - 16);

  // 设置玩家与图层的碰撞
  this.physics.add.collider(player, layer);

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.add.text(16, 520, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示玩家位置（可验证的状态信号）
  this.positionText = this.add.text(16, 16, '', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });

  updatePositionText.call(this);
}

function update(time, delta) {
  // 更新移动计时器
  if (moveTimer > 0) {
    moveTimer -= delta;
    return;
  }

  let newX = playerX;
  let newY = playerY;
  let moved = false;

  // 检测方向键输入
  if (cursors.left.isDown) {
    newX = playerX - 1;
    moved = true;
  } else if (cursors.right.isDown) {
    newX = playerX + 1;
    moved = true;
  } else if (cursors.up.isDown) {
    newY = playerY - 1;
    moved = true;
  } else if (cursors.down.isDown) {
    newY = playerY + 1;
    moved = true;
  }

  // 如果尝试移动，检查新位置是否有效
  if (moved) {
    if (canMoveTo(newX, newY)) {
      playerX = newX;
      playerY = newY;
      
      // 平滑移动到新位置
      this.tweens.add({
        targets: player,
        x: playerX * TILE_SIZE + TILE_SIZE / 2,
        y: playerY * TILE_SIZE + TILE_SIZE / 2,
        duration: 150,
        ease: 'Power2'
      });

      moveTimer = MOVE_DELAY;
      updatePositionText.call(this);
    } else {
      // 碰到墙壁，播放抖动效果
      this.cameras.main.shake(100, 0.005);
      moveTimer = MOVE_DELAY / 2; // 碰墙后较短的冷却时间
    }
  }
}

// 检查是否可以移动到指定位置
function canMoveTo(x, y) {
  // 检查边界
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return false;
  }
  
  // 检查是否是墙壁
  return mapData[y][x] === 0;
}

// 更新位置文本显示
function updatePositionText() {
  this.positionText.setText(`Position: (${playerX}, ${playerY})`);
}

// 启动游戏
new Phaser.Game(config);