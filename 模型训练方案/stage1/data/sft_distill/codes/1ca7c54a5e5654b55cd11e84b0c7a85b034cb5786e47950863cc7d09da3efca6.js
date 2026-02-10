const config = {
  type: Phaser.AUTO,
  width: 800,
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
  },
  backgroundColor: '#2d2d2d'
};

// 状态信号变量
let gameState = {
  playerX: 0,
  playerY: 0,
  totalDistance: 0,
  isMoving: false
};

let player;
let cursors;
let mainCamera;
let miniMapCamera;
let worldWidth = 1600;
let worldHeight = 1200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  
  // 创建地图背景（网格）
  const mapGraphics = this.add.graphics();
  mapGraphics.lineStyle(2, 0x444444, 1);
  
  // 绘制网格
  const gridSize = 100;
  for (let x = 0; x <= worldWidth; x += gridSize) {
    mapGraphics.lineBetween(x, 0, x, worldHeight);
  }
  for (let y = 0; y <= worldHeight; y += gridSize) {
    mapGraphics.lineBetween(0, y, worldWidth, y);
  }
  
  // 绘制世界边界
  mapGraphics.lineStyle(4, 0x00ff00, 1);
  mapGraphics.strokeRect(0, 0, worldWidth, worldHeight);
  
  // 创建一些障碍物（装饰）
  const obstacles = this.add.graphics();
  obstacles.fillStyle(0x8b4513, 1);
  
  // 使用固定种子创建确定性障碍物
  const obstaclePositions = [
    { x: 200, y: 200, w: 100, h: 100 },
    { x: 600, y: 400, w: 150, h: 80 },
    { x: 1200, y: 300, w: 120, h: 120 },
    { x: 400, y: 800, w: 100, h: 100 },
    { x: 1000, y: 900, w: 180, h: 60 },
    { x: 1400, y: 600, w: 100, h: 150 }
  ];
  
  obstaclePositions.forEach(obs => {
    obstacles.fillRect(obs.x, obs.y, obs.w, obs.h);
  });
  
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ffff, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.lineStyle(3, 0xffffff, 1);
  playerGraphics.strokeCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
  
  // 创建玩家
  player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(240, 240);
  
  // 初始化状态
  gameState.playerX = player.x;
  gameState.playerY = player.y;
  
  // 设置主相机
  mainCamera = this.cameras.main;
  mainCamera.setBounds(0, 0, worldWidth, worldHeight);
  mainCamera.startFollow(player, true, 0.1, 0.1);
  mainCamera.setZoom(1);
  
  // 创建小地图相机
  const miniMapWidth = 200;
  const miniMapHeight = 150;
  const miniMapX = config.width - miniMapWidth - 10;
  const miniMapY = 10;
  
  miniMapCamera = this.cameras.add(miniMapX, miniMapY, miniMapWidth, miniMapHeight);
  miniMapCamera.setBounds(0, 0, worldWidth, worldHeight);
  miniMapCamera.setZoom(0.125); // 200/1600 = 0.125
  miniMapCamera.centerOn(worldWidth / 2, worldHeight / 2);
  miniMapCamera.setBackgroundColor(0x000000);
  miniMapCamera.setAlpha(0.8);
  
  // 创建小地图边框（使用主相机渲染，不跟随世界）
  const miniMapBorder = this.add.graphics();
  miniMapBorder.lineStyle(3, 0xffffff, 1);
  miniMapBorder.strokeRect(miniMapX - 2, miniMapY - 2, miniMapWidth + 4, miniMapHeight + 4);
  miniMapBorder.setScrollFactor(0);
  miniMapBorder.setDepth(1000);
  
  // 在小地图上添加标题文本
  const miniMapLabel = this.add.text(miniMapX + 5, miniMapY + 5, 'MAP', {
    fontSize: '12px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 4, y: 2 }
  });
  miniMapLabel.setScrollFactor(0);
  miniMapLabel.setDepth(1001);
  
  // 忽略边框和文本在小地图中的渲染
  miniMapCamera.ignore([miniMapBorder, miniMapLabel]);
  
  // 创建玩家位置显示文本
  const positionText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  positionText.setScrollFactor(0);
  positionText.setDepth(1000);
  
  // 忽略UI文本在小地图中的渲染
  miniMapCamera.ignore(positionText);
  
  // 存储文本引用
  this.positionText = positionText;
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD控制
  this.keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加调试信息
  console.log('Game initialized');
  console.log('World size:', worldWidth, 'x', worldHeight);
  console.log('Player speed: 240');
  console.log('Mini-map zoom:', miniMapCamera.zoom);
}

function update(time, delta) {
  // 记录上一帧位置
  const lastX = player.x;
  const lastY = player.y;
  
  // 重置速度
  player.setVelocity(0);
  
  let moving = false;
  
  // 处理键盘输入
  if (cursors.left.isDown || this.keys.A.isDown) {
    player.setVelocityX(-240);
    moving = true;
  } else if (cursors.right.isDown || this.keys.D.isDown) {
    player.setVelocityX(240);
    moving = true;
  }
  
  if (cursors.up.isDown || this.keys.W.isDown) {
    player.setVelocityY(-240);
    moving = true;
  } else if (cursors.down.isDown || this.keys.S.isDown) {
    player.setVelocityY(240);
    moving = true;
  }
  
  // 对角线移动时归一化速度
  if (moving && player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(240);
  }
  
  // 更新状态信号
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);
  gameState.isMoving = moving;
  
  // 计算移动距离
  const dx = player.x - lastX;
  const dy = player.y - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  gameState.totalDistance += distance;
  
  // 更新位置文本
  this.positionText.setText(
    `Position: (${gameState.playerX}, ${gameState.playerY})\n` +
    `Distance: ${Math.round(gameState.totalDistance)}\n` +
    `Moving: ${gameState.isMoving ? 'YES' : 'NO'}`
  );
  
  // 小地图相机始终显示整个世界（不跟随玩家）
  // 如果想让小地图也跟随玩家，可以取消下面的注释
  // miniMapCamera.centerOn(player.x, player.y);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供外部验证
if (typeof window !== 'undefined') {
  window.gameState = gameState;
}