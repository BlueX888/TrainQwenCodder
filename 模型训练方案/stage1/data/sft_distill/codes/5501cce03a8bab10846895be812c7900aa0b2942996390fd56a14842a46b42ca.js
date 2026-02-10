const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态信号
let gameState = {
  playerX: 0,
  playerY: 0,
  cameraX: 0,
  cameraY: 0,
  minimapActive: true
};

let player;
let cursors;
let mainCamera;
let miniMapCamera;
const PLAYER_SPEED = 80;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;
const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界
  this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // 绘制世界背景网格
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.2);
  
  // 绘制网格
  for (let x = 0; x <= WORLD_WIDTH; x += 100) {
    graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
    graphics.lineBetween(0, y, WORLD_WIDTH, y);
  }

  // 绘制世界边界
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // 绘制一些障碍物作为参照物
  graphics.fillStyle(0xff6600, 1);
  graphics.fillRect(300, 200, 150, 150);
  graphics.fillRect(800, 600, 200, 100);
  graphics.fillRect(1500, 400, 100, 300);
  graphics.fillRect(2000, 1200, 250, 150);
  graphics.fillRect(600, 1400, 180, 180);

  // 绘制一些标记点
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(400, 400, 30);
  graphics.fillCircle(1200, 900, 30);
  graphics.fillCircle(1800, 600, 30);
  graphics.fillCircle(1000, 1500, 30);

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff0000, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.fillStyle(0xffffff, 1);
  playerGraphics.fillCircle(16, 12, 4); // 眼睛
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建玩家
  player = this.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'player');
  player.setOrigin(0.5, 0.5);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 配置主相机
  mainCamera = this.cameras.main;
  mainCamera.startFollow(player, true, 0.1, 0.1);
  mainCamera.setZoom(1);

  // 创建小地图相机
  miniMapCamera = this.cameras.add(
    config.width - MINIMAP_WIDTH - 10,  // x: 右上角
    10,                                   // y: 顶部
    MINIMAP_WIDTH,                        // width
    MINIMAP_HEIGHT                        // height
  );

  // 配置小地图相机
  miniMapCamera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  miniMapCamera.setZoom(MINIMAP_WIDTH / WORLD_WIDTH); // 缩放以显示整个世界
  miniMapCamera.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  miniMapCamera.setBackgroundColor(0x000000);

  // 添加小地图边框
  const minimapBorder = this.add.graphics();
  minimapBorder.lineStyle(3, 0xffffff, 1);
  minimapBorder.strokeRect(
    config.width - MINIMAP_WIDTH - 10,
    10,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT
  );
  minimapBorder.setScrollFactor(0); // 固定在屏幕上
  minimapBorder.setDepth(1000);

  // 添加小地图标题
  const minimapTitle = this.add.text(
    config.width - MINIMAP_WIDTH - 10,
    10 + MINIMAP_HEIGHT + 5,
    'MINI MAP',
    {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  minimapTitle.setScrollFactor(0);
  minimapTitle.setDepth(1000);

  // 添加玩家位置指示器（在小地图上）
  const playerIndicator = this.add.graphics();
  playerIndicator.fillStyle(0xff0000, 1);
  playerIndicator.fillCircle(0, 0, 3);
  
  // 使用 update 循环更新指示器位置
  this.playerIndicator = playerIndicator;

  // 添加操作提示
  const helpText = this.add.text(10, 10, 'Use Arrow Keys to Move\nSpeed: 80 px/s', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  helpText.setScrollFactor(0);
  helpText.setDepth(1000);

  // 添加坐标显示
  this.coordText = this.add.text(10, 70, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
  this.coordText.setDepth(1000);

  console.log('Game initialized - Player at center, minimap active');
}

function update(time, delta) {
  // 玩家移动逻辑
  let velocityX = 0;
  let velocityY = 0;

  if (cursors.left.isDown) {
    velocityX = -PLAYER_SPEED;
  } else if (cursors.right.isDown) {
    velocityX = PLAYER_SPEED;
  }

  if (cursors.up.isDown) {
    velocityY = -PLAYER_SPEED;
  } else if (cursors.down.isDown) {
    velocityY = PLAYER_SPEED;
  }

  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2;
    velocityX *= factor;
    velocityY *= factor;
  }

  // 更新玩家位置
  player.x += velocityX * (delta / 1000);
  player.y += velocityY * (delta / 1000);

  // 限制玩家在世界边界内
  player.x = Phaser.Math.Clamp(player.x, 16, WORLD_WIDTH - 16);
  player.y = Phaser.Math.Clamp(player.y, 16, WORLD_HEIGHT - 16);

  // 更新小地图上的玩家指示器位置
  if (this.playerIndicator) {
    // 计算玩家在小地图上的位置
    const minimapX = config.width - MINIMAP_WIDTH - 10 + (player.x / WORLD_WIDTH) * MINIMAP_WIDTH;
    const minimapY = 10 + (player.y / WORLD_HEIGHT) * MINIMAP_HEIGHT;
    
    this.playerIndicator.clear();
    this.playerIndicator.fillStyle(0xffff00, 1);
    this.playerIndicator.fillCircle(minimapX, minimapY, 3);
    this.playerIndicator.setScrollFactor(0);
    this.playerIndicator.setDepth(1001);
  }

  // 更新状态信号
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);
  gameState.cameraX = Math.round(mainCamera.scrollX);
  gameState.cameraY = Math.round(mainCamera.scrollY);

  // 更新坐标显示
  if (this.coordText) {
    this.coordText.setText(
      `Player: (${gameState.playerX}, ${gameState.playerY})\n` +
      `Camera: (${gameState.cameraX}, ${gameState.cameraY})`
    );
  }
}

const game = new Phaser.Game(config);