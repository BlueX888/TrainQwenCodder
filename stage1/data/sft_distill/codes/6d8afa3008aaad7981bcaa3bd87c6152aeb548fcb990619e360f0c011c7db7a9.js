const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
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

// 状态信号变量
let playerX = 0;
let playerY = 0;
let moveCount = 0;

// 15x15 地图数据 (0=空地, 1=墙)
const mapData = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const TILE_SIZE = 32;
let player;
let cursors;
let map;
let layer;

function preload() {
  // 使用 Graphics 创建纹理，不依赖外部资源
  
  // 创建地面纹理 (浅灰色)
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0xcccccc, 1);
  groundGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  groundGraphics.generateTexture('ground', TILE_SIZE, TILE_SIZE);
  groundGraphics.destroy();
  
  // 创建墙体纹理 (深灰色带边框)
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x444444, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.lineStyle(2, 0x222222, 1);
  wallGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();
  
  // 创建玩家纹理 (蓝色圆形)
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  playerGraphics.lineStyle(2, 0x2980b9, 1);
  playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
}

function create() {
  // 创建 Tilemap
  map = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });
  
  // 添加 tileset (使用我们创建的纹理)
  const tiles = map.addTilesetImage('ground', null, TILE_SIZE, TILE_SIZE);
  
  // 创建图层
  layer = map.createLayer(0, tiles, 0, 0);
  
  // 手动设置每个 tile 的纹理
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const tile = layer.getTileAt(x, y);
      if (tile) {
        if (mapData[y][x] === 1) {
          // 墙体
          tile.setCollision(true, true, true, true);
          // 使用 Graphics 在墙体位置绘制
          const wallSprite = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'wall').setOrigin(0, 0);
        } else {
          // 地面
          const groundSprite = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'ground').setOrigin(0, 0);
        }
      }
    }
  }
  
  // 设置碰撞 (所有值为1的tile可碰撞)
  layer.setCollisionByProperty({ collides: true });
  layer.setCollisionBetween(1, 1);
  
  // 创建玩家 (初始位置在空地上，例如 [1,1])
  player = this.physics.add.sprite(1.5 * TILE_SIZE, 1.5 * TILE_SIZE, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(TILE_SIZE - 8, TILE_SIZE - 8);
  
  // 设置玩家与tilemap的碰撞
  this.physics.add.collider(player, layer);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 初始化状态变量
  playerX = Math.floor(player.x / TILE_SIZE);
  playerY = Math.floor(player.y / TILE_SIZE);
  
  // 添加文本显示状态
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 5, y: 5 }
  });
  
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 5, y: 5 }
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  const speed = 150;
  
  // 方向键控制
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
  
  // 更新状态变量
  const newX = Math.floor(player.x / TILE_SIZE);
  const newY = Math.floor(player.y / TILE_SIZE);
  
  if (newX !== playerX || newY !== playerY) {
    playerX = newX;
    playerY = newY;
    moveCount++;
  }
  
  // 更新状态显示
  this.statusText.setText(
    `Position: (${playerX}, ${playerY})\n` +
    `Moves: ${moveCount}\n` +
    `Tile: ${mapData[playerY] ? mapData[playerY][playerX] : 'out'}`
  );
}

new Phaser.Game(config);