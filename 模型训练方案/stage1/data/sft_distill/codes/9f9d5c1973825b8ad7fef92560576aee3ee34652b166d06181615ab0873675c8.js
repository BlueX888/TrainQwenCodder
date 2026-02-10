const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
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

// 状态变量
let gameState = {
  playerX: 1,
  playerY: 1,
  moveCount: 0,
  canMove: true
};

// 3x3地图数组：0=空地，1=墙壁
const mapData = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
];

let player;
let tilemap;
let layer;
let cursors;
let tileSize = 160;

function preload() {
  // 程序化生成纹理
  createTextures(this);
}

function create() {
  // 创建空白Tilemap
  tilemap = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: 3,
    height: 3
  });

  // 添加tileset（使用生成的纹理）
  const tiles = tilemap.addTilesetImage('tiles');
  
  // 创建图层
  layer = tilemap.createBlankLayer('layer1', tiles);
  
  // 根据mapData填充瓦片
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      if (mapData[y][x] === 1) {
        // 放置墙壁瓦片（索引1）
        layer.putTileAt(1, x, y);
      } else {
        // 放置地板瓦片（索引0）
        layer.putTileAt(0, x, y);
      }
    }
  }
  
  // 设置墙壁瓦片可碰撞
  layer.setCollision(1);
  
  // 创建玩家
  player = this.physics.add.sprite(
    gameState.playerX * tileSize + tileSize / 2,
    gameState.playerY * tileSize + tileSize / 2,
    'player'
  );
  
  player.setCollideWorldBounds(true);
  player.body.setSize(tileSize * 0.6, tileSize * 0.6);
  
  // 添加玩家与Tilemap的碰撞
  this.physics.add.collider(player, layer);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '18px',
    fill: '#00ff00'
  });
  
  updateStatusText(this);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  const speed = 200;
  let moved = false;
  
  // 方向键控制
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    moved = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    moved = true;
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    moved = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    moved = true;
  }
  
  // 更新玩家位置状态
  if (moved && gameState.canMove) {
    const newX = Math.floor(player.x / tileSize);
    const newY = Math.floor(player.y / tileSize);
    
    if (newX !== gameState.playerX || newY !== gameState.playerY) {
      gameState.playerX = newX;
      gameState.playerY = newY;
      gameState.moveCount++;
      updateStatusText(this);
    }
  }
}

function createTextures(scene) {
  // 创建地板纹理（索引0）
  const floorGraphics = scene.add.graphics();
  floorGraphics.fillStyle(0x444444, 1);
  floorGraphics.fillRect(0, 0, tileSize, tileSize);
  floorGraphics.lineStyle(2, 0x666666, 1);
  floorGraphics.strokeRect(0, 0, tileSize, tileSize);
  floorGraphics.generateTexture('floor', tileSize, tileSize);
  floorGraphics.destroy();
  
  // 创建墙壁纹理（索引1）
  const wallGraphics = scene.add.graphics();
  wallGraphics.fillStyle(0x8b4513, 1);
  wallGraphics.fillRect(0, 0, tileSize, tileSize);
  wallGraphics.fillStyle(0xa0522d, 1);
  wallGraphics.fillRect(10, 10, tileSize - 20, tileSize - 20);
  wallGraphics.lineStyle(3, 0x654321, 1);
  wallGraphics.strokeRect(0, 0, tileSize, tileSize);
  wallGraphics.generateTexture('wall', tileSize, tileSize);
  wallGraphics.destroy();
  
  // 创建玩家纹理
  const playerGraphics = scene.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(tileSize / 2, tileSize / 2, tileSize * 0.3);
  playerGraphics.fillStyle(0xffffff, 1);
  playerGraphics.fillCircle(tileSize / 2 - 15, tileSize / 2 - 10, 8);
  playerGraphics.fillCircle(tileSize / 2 + 15, tileSize / 2 - 10, 8);
  playerGraphics.fillStyle(0x000000, 1);
  playerGraphics.fillCircle(tileSize / 2 - 15, tileSize / 2 - 10, 4);
  playerGraphics.fillCircle(tileSize / 2 + 15, tileSize / 2 - 10, 4);
  playerGraphics.generateTexture('player', tileSize, tileSize);
  playerGraphics.destroy();
  
  // 手动创建tileset纹理（包含地板和墙壁）
  const tilesetGraphics = scene.add.graphics();
  
  // 绘制地板（0,0位置）
  tilesetGraphics.fillStyle(0x444444, 1);
  tilesetGraphics.fillRect(0, 0, tileSize, tileSize);
  tilesetGraphics.lineStyle(2, 0x666666, 1);
  tilesetGraphics.strokeRect(0, 0, tileSize, tileSize);
  
  // 绘制墙壁（0,tileSize位置）
  tilesetGraphics.fillStyle(0x8b4513, 1);
  tilesetGraphics.fillRect(0, tileSize, tileSize, tileSize);
  tilesetGraphics.fillStyle(0xa0522d, 1);
  tilesetGraphics.fillRect(10, tileSize + 10, tileSize - 20, tileSize - 20);
  tilesetGraphics.lineStyle(3, 0x654321, 1);
  tilesetGraphics.strokeRect(0, tileSize, tileSize, tileSize);
  
  tilesetGraphics.generateTexture('tiles', tileSize, tileSize * 2);
  tilesetGraphics.destroy();
}

function updateStatusText(scene) {
  scene.statusText.setText(
    `Position: (${gameState.playerX}, ${gameState.playerY}) | Moves: ${gameState.moveCount}`
  );
}

new Phaser.Game(config);