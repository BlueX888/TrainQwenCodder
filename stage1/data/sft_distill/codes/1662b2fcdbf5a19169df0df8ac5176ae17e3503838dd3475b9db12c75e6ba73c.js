const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: { preload, create, update },
  backgroundColor: '#1a1a2e'
};

// 状态信号变量
let gameState = {
  playerX: 0,
  playerY: 0,
  cameraX: 0,
  cameraY: 0,
  minimapActive: true,
  worldWidth: 2000,
  worldHeight: 1500
};

let player;
let cursors;
let mainCamera;
let minimap;
let graphics;
let playerSpeed = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界
  this.cameras.main.setBounds(0, 0, gameState.worldWidth, gameState.worldHeight);
  this.physics.world.setBounds(0, 0, gameState.worldWidth, gameState.worldHeight);

  // 创建背景网格
  graphics = this.add.graphics();
  drawWorldBackground.call(this, graphics);

  // 创建一些地标物体
  createLandmarks.call(this, graphics);

  // 创建玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(-16, -16, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建玩家精灵（带物理）
  player = this.physics.add.sprite(
    gameState.worldWidth / 2,
    gameState.worldHeight / 2,
    'player'
  );
  player.setCollideWorldBounds(true);
  player.setDepth(10);

  // 主相机跟随玩家
  mainCamera = this.cameras.main;
  mainCamera.startFollow(player, true, 0.1, 0.1);
  mainCamera.setZoom(1);

  // 创建小地图相机
  const minimapWidth = 200;
  const minimapHeight = 150;
  const minimapPadding = 10;

  minimap = this.cameras.add(
    config.width - minimapWidth - minimapPadding,
    minimapPadding,
    minimapWidth,
    minimapHeight
  );

  // 设置小地图显示整个世界
  minimap.setBounds(0, 0, gameState.worldWidth, gameState.worldHeight);
  minimap.setZoom(Math.min(
    minimapWidth / gameState.worldWidth,
    minimapHeight / gameState.worldHeight
  ));

  // 小地图边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(
    config.width - minimapWidth - minimapPadding,
    minimapPadding,
    minimapWidth,
    minimapHeight
  );
  borderGraphics.setScrollFactor(0);
  borderGraphics.setDepth(100);

  // 忽略边框在小地图中显示
  minimap.ignore(borderGraphics);

  // 在小地图上绘制主相机视野框
  const viewportBox = this.add.graphics();
  viewportBox.setDepth(11);
  this.viewportBox = viewportBox;

  // 小地图也忽略视野框（避免递归显示）
  minimap.ignore(viewportBox);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  const helpText = this.add.text(10, 10, 
    'Arrow Keys: Move Player\nGreen Square: Player\nWhite Box (minimap): Main Camera View', 
    {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  helpText.setScrollFactor(0);
  helpText.setDepth(100);
  minimap.ignore(helpText);

  // 状态显示文本
  this.statusText = this.add.text(10, config.height - 30,
    '',
    {
      fontSize: '12px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    }
  );
  this.statusText.setScrollFactor(0);
  this.statusText.setDepth(100);
  minimap.ignore(this.statusText);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 键盘控制
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

  // 更新状态信号
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);
  gameState.cameraX = Math.round(mainCamera.scrollX);
  gameState.cameraY = Math.round(mainCamera.scrollY);

  // 绘制主相机视野框在世界坐标中
  this.viewportBox.clear();
  this.viewportBox.lineStyle(2, 0xffff00, 1);
  this.viewportBox.strokeRect(
    mainCamera.scrollX,
    mainCamera.scrollY,
    mainCamera.width,
    mainCamera.height
  );

  // 更新状态文本
  this.statusText.setText(
    `Player: (${gameState.playerX}, ${gameState.playerY}) | ` +
    `Camera: (${gameState.cameraX}, ${gameState.cameraY})`
  );
}

function drawWorldBackground(graphics) {
  // 绘制网格背景
  graphics.lineStyle(1, 0x333333, 0.5);
  
  const gridSize = 100;
  
  // 垂直线
  for (let x = 0; x <= gameState.worldWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, gameState.worldHeight);
  }
  
  // 水平线
  for (let y = 0; y <= gameState.worldHeight; y += gridSize) {
    graphics.lineBetween(0, y, gameState.worldWidth, y);
  }

  // 绘制世界边界
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(0, 0, gameState.worldWidth, gameState.worldHeight);
}

function createLandmarks(graphics) {
  // 创建一些地标物体，方便观察小地图效果
  const landmarks = [
    { x: 200, y: 200, width: 100, height: 100, color: 0xff0000 },
    { x: 1700, y: 200, width: 150, height: 150, color: 0x0000ff },
    { x: 200, y: 1200, width: 120, height: 120, color: 0xffff00 },
    { x: 1600, y: 1200, width: 180, height: 180, color: 0xff00ff },
    { x: 900, y: 700, width: 200, height: 100, color: 0x00ffff }
  ];

  landmarks.forEach(landmark => {
    graphics.fillStyle(landmark.color, 0.7);
    graphics.fillRect(landmark.x, landmark.y, landmark.width, landmark.height);
    
    // 添加边框
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(landmark.x, landmark.y, landmark.width, landmark.height);
  });
}

new Phaser.Game(config);