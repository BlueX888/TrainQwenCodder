const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
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
const gameState = {
  playerX: 0,
  playerY: 0,
  playerTileX: 0,
  playerTileY: 0,
  moveCount: 0,
  collisionCount: 0
};

// 20x20地图数据，0=空地，1=墙
const mapData = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const TILE_SIZE = 40;
let player;
let cursors;
let map;
let layer;

function preload() {
  // 使用Graphics创建tile纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 创建空地tile（浅灰色）
  graphics.fillStyle(0xcccccc, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(1, 0x999999, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 创建墙tile（深灰色）
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(2, 0x000000, 1);
  graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 创建玩家纹理（蓝色圆形）
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  graphics.lineStyle(2, 0x0000aa, 1);
  graphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 4);
  graphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  
  graphics.destroy();
}

function create() {
  // 创建空白tilemap
  map = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: 20,
    height: 20
  });
  
  // 添加tileset
  const tileset = map.addTilesetImage('tiles', null, TILE_SIZE, TILE_SIZE);
  
  // 创建图层
  layer = map.createBlankLayer('layer1', tileset, 0, 0);
  
  // 填充地图数据
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const tileIndex = mapData[y][x];
      if (tileIndex === 0) {
        // 空地
        const tile = layer.putTileAt(-1, x, y);
      } else if (tileIndex === 1) {
        // 墙
        const tile = layer.putTileAt(0, x, y);
        if (tile) {
          tile.setCollision(true);
        }
      }
    }
  }
  
  // 手动渲染tile纹理
  layer.forEachTile(tile => {
    if (tile.index === 0) {
      // 墙tile
      const sprite = this.add.image(
        tile.pixelX + TILE_SIZE / 2,
        tile.pixelY + TILE_SIZE / 2,
        'wall'
      );
      sprite.setOrigin(0.5, 0.5);
    }
  });
  
  // 渲染空地
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      if (mapData[y][x] === 0) {
        const sprite = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'floor'
        );
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(-1);
      }
    }
  }
  
  // 创建玩家（放在第一个空地位置）
  let startX = 1;
  let startY = 1;
  player = this.physics.add.sprite(
    startX * TILE_SIZE + TILE_SIZE / 2,
    startY * TILE_SIZE + TILE_SIZE / 2,
    'player'
  );
  player.setCollideWorldBounds(true);
  player.setDepth(1);
  
  // 设置玩家碰撞体
  player.body.setSize(TILE_SIZE - 8, TILE_SIZE - 8);
  
  // 初始化状态
  gameState.playerX = player.x;
  gameState.playerY = player.y;
  gameState.playerTileX = startX;
  gameState.playerTileY = startY;
  
  // 设置tilemap碰撞
  layer.setCollisionByProperty({ collides: true });
  this.physics.add.collider(player, layer, onCollision, null, this);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(10);
  statusText.setScrollFactor(0);
  
  // 更新状态显示
  this.events.on('postupdate', () => {
    statusText.setText([
      `Position: (${gameState.playerTileX}, ${gameState.playerTileY})`,
      `Moves: ${gameState.moveCount}`,
      `Collisions: ${gameState.collisionCount}`
    ]);
  });
}

function update(time, delta) {
  if (!player || !cursors) return;
  
  const speed = 200;
  
  // 重置速度
  player.setVelocity(0);
  
  // 方向键控制
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    gameState.moveCount++;
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    gameState.moveCount++;
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    gameState.moveCount++;
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    gameState.moveCount++;
  }
  
  // 更新玩家tile位置
  gameState.playerX = player.x;
  gameState.playerY = player.y;
  gameState.playerTileX = Math.floor(player.x / TILE_SIZE);
  gameState.playerTileY = Math.floor(player.y / TILE_SIZE);
  
  // 检查是否在墙内（额外安全检查）
  const tileX = Math.floor(player.x / TILE_SIZE);
  const tileY = Math.floor(player.y / TILE_SIZE);
  
  if (tileX >= 0 && tileX < 20 && tileY >= 0 && tileY < 20) {
    if (mapData[tileY][tileX] === 1) {
      // 如果在墙内，推回到最近的空地
      player.setVelocity(0);
      gameState.collisionCount++;
    }
  }
}

function onCollision(player, tile) {
  // 碰撞回调
  gameState.collisionCount++;
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, config };
}