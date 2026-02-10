const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
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
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  moveCount: 0,
  collisionCount: 0,
  isMoving: false,
  gameReady: false
};

// 10x10 地图数据：0=空地，1=墙壁
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE_SIZE = 64;
let player;
let cursors;
let tilemap;
let layer;
let playerSpeed = 200;

function preload() {
  // 使用Graphics创建tile纹理
  createTileTextures(this);
  createPlayerTexture(this);
}

function create() {
  // 创建tilemap
  tilemap = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: 10,
    height: 10
  });

  // 添加tileset（使用我们创建的纹理）
  const tiles = tilemap.addTilesetImage('tiles');
  
  // 创建空白图层
  layer = tilemap.createBlankLayer('layer1', tiles, 0, 0);
  
  // 填充地图数据
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const tileIndex = mapData[y][x];
      if (tileIndex === 1) {
        // 放置墙壁tile（索引1）
        layer.putTileAt(1, x, y);
      } else {
        // 放置空地tile（索引0）
        layer.putTileAt(0, x, y);
      }
    }
  }
  
  // 设置碰撞：tile索引为1的是墙壁
  layer.setCollisionByProperty({ collides: true });
  
  // 为所有索引为1的tile设置碰撞
  layer.setCollision(1);
  
  // 创建玩家（起始位置在地图中央空地）
  player = this.physics.add.sprite(
    TILE_SIZE * 1.5,
    TILE_SIZE * 1.5,
    'player'
  );
  
  player.setCollideWorldBounds(true);
  player.body.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.6);
  
  // 设置玩家与tilemap的碰撞
  this.physics.add.collider(player, layer, onPlayerCollision);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD作为备选控制
  this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 更新初始状态
  updateSignals();
  window.__signals__.gameReady = true;
  
  // 添加调试文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setScrollFactor(0).setDepth(100);
  
  console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
}

function update() {
  if (!player) return;
  
  // 重置速度
  player.setVelocity(0);
  
  let moving = false;
  
  // 处理方向键输入
  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
    moving = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
    moving = true;
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
    moving = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
    moving = true;
  }
  
  // 更新状态信号
  if (moving !== window.__signals__.isMoving) {
    window.__signals__.isMoving = moving;
    if (moving) {
      window.__signals__.moveCount++;
    }
  }
  
  // 更新玩家位置
  const newX = Math.round(player.x / TILE_SIZE * 10) / 10;
  const newY = Math.round(player.y / TILE_SIZE * 10) / 10;
  
  if (newX !== window.__signals__.playerPosition.x || 
      newY !== window.__signals__.playerPosition.y) {
    updateSignals();
  }
}

function onPlayerCollision(player, tile) {
  // 碰撞回调
  window.__signals__.collisionCount++;
  console.log('Collision detected:', JSON.stringify({
    collisionCount: window.__signals__.collisionCount,
    tileIndex: tile.index,
    tilePos: { x: tile.x, y: tile.y }
  }));
}

function createTileTextures(scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // 创建空地纹理（索引0）
  graphics.clear();
  graphics.fillStyle(0x228B22, 1); // 草绿色
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.lineStyle(2, 0x1a6b1a, 1);
  graphics.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
  graphics.generateTexture('tile_floor', TILE_SIZE, TILE_SIZE);
  
  // 创建墙壁纹理（索引1）
  graphics.clear();
  graphics.fillStyle(0x696969, 1); // 灰色
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.fillStyle(0x505050, 1);
  graphics.fillRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
  graphics.lineStyle(3, 0x404040, 1);
  graphics.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  graphics.generateTexture('tile_wall', TILE_SIZE, TILE_SIZE);
  
  graphics.destroy();
  
  // 手动创建tileset数据结构
  scene.textures.addSpriteSheet('tiles', 
    scene.textures.get('tile_floor').getSourceImage(), {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE
    }
  );
  
  // 为tilemap准备纹理映射
  const tilesTexture = scene.textures.get('tiles');
  tilesTexture.add(0, 0, 0, 0, TILE_SIZE, TILE_SIZE);
  tilesTexture.add(1, 0, 0, 0, TILE_SIZE, TILE_SIZE);
  
  // 将墙壁纹理也添加到tiles中
  scene.textures.addImage('tile_wall_temp', scene.textures.get('tile_wall').getSourceImage());
}

function createPlayerTexture(scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // 创建玩家纹理（蓝色圆形）
  graphics.clear();
  graphics.fillStyle(0x4169E1, 1); // 皇家蓝
  graphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE * 0.3);
  graphics.lineStyle(4, 0xFFFFFF, 1);
  graphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE * 0.3);
  
  // 添加眼睛
  graphics.fillStyle(0xFFFFFF, 1);
  graphics.fillCircle(TILE_SIZE * 0.4, TILE_SIZE * 0.4, 4);
  graphics.fillCircle(TILE_SIZE * 0.6, TILE_SIZE * 0.4, 4);
  
  graphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  graphics.destroy();
}

function updateSignals() {
  window.__signals__.playerPosition = {
    x: Math.round(player.x / TILE_SIZE * 10) / 10,
    y: Math.round(player.y / TILE_SIZE * 10) / 10
  };
  
  // 计算玩家所在的tile坐标
  const tileX = Math.floor(player.x / TILE_SIZE);
  const tileY = Math.floor(player.y / TILE_SIZE);
  
  console.log('Player moved:', JSON.stringify({
    pixelPos: { x: Math.round(player.x), y: Math.round(player.y) },
    tilePos: { x: tileX, y: tileY },
    moveCount: window.__signals__.moveCount,
    collisionCount: window.__signals__.collisionCount
  }));
}

// 启动游戏
new Phaser.Game(config);