const config = {
  type: Phaser.AUTO,
  width: 300,
  height: 300,
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
  },
  backgroundColor: '#2d2d2d'
};

// 状态信号变量
let playerPosition = { x: 0, y: 0 };
let collisionCount = 0;

// 3x3 地图数组：0=空地，1=墙壁
const mapData = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
];

const TILE_SIZE = 100;
let player;
let cursors;
let tilemap;
let layer;
let moveSpeed = 200;

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 1. 创建墙壁纹理
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x555555, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.lineStyle(4, 0x333333, 1);
  wallGraphics.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();

  // 2. 创建空地纹理
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0xaaaaaa, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(2, 0x999999, 1);
  floorGraphics.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
  floorGraphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();

  // 3. 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(20, 20, 18);
  playerGraphics.lineStyle(3, 0x00aa00, 1);
  playerGraphics.strokeCircle(20, 20, 18);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 4. 创建 Tilemap（使用空白地图）
  tilemap = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });

  // 5. 添加 tileset（使用生成的纹理）
  const tiles = tilemap.addTilesetImage('floor', 'floor', TILE_SIZE, TILE_SIZE);
  const wallTiles = tilemap.addTilesetImage('wall', 'wall', TILE_SIZE, TILE_SIZE);

  // 6. 创建图层
  layer = tilemap.createLayer(0, [tiles, wallTiles], 0, 0);

  // 7. 遍历地图数据，设置正确的瓦片纹理
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      const tile = layer.getTileAt(x, y);
      if (tile) {
        if (mapData[y][x] === 1) {
          // 墙壁
          tile.index = 1;
          tile.setCollision(true);
        } else {
          // 空地
          tile.index = 0;
        }
      }
    }
  }

  // 8. 设置碰撞（瓦片索引1为墙壁）
  layer.setCollisionByProperty({ collides: true });
  layer.setCollision(1);

  // 9. 创建玩家（放在中心空地）
  player = this.physics.add.sprite(150, 150, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(30, 30);
  player.body.setOffset(5, 5);

  // 10. 设置玩家与图层的碰撞
  this.physics.add.collider(player, layer, () => {
    collisionCount++;
  });

  // 11. 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 12. 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  statusText.setDepth(100);

  // 更新状态显示
  this.events.on('update', () => {
    playerPosition.x = Math.round(player.x);
    playerPosition.y = Math.round(player.y);
    statusText.setText(
      `Position: (${playerPosition.x}, ${playerPosition.y})\n` +
      `Collisions: ${collisionCount}`
    );
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 处理键盘输入
  if (cursors.left.isDown) {
    player.setVelocityX(-moveSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(moveSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-moveSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(moveSpeed);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(moveSpeed);
  }
}

// 启动游戏
const game = new Phaser.Game(config);