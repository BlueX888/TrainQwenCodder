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
  }
};

// 状态信号
let gameState = {
  playerX: 0,
  playerY: 0,
  score: 0,
  level: 1
};

let player;
let cursors;
let miniMapCamera;
let obstacles;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界（比屏幕大，方便相机跟随演示）
  const worldWidth = 2400;
  const worldHeight = 1800;
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

  // 创建背景网格
  createBackground(this, worldWidth, worldHeight);

  // 创建障碍物
  obstacles = this.add.group();
  createObstacles(this, worldWidth, worldHeight);

  // 生成玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
  player.setCollideWorldBounds(true);

  // 主相机设置：跟随玩家
  const mainCamera = this.cameras.main;
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
  miniMapCamera.setZoom(0.1); // 缩小显示全局
  miniMapCamera.setBackgroundColor(0x000000);
  miniMapCamera.setAlpha(0.8);

  // 为小地图添加边框
  const border = this.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(miniMapX - 2, miniMapY - 2, miniMapWidth + 4, miniMapHeight + 4);
  border.setScrollFactor(0);
  border.setDepth(1000);

  // 小地图标题
  const miniMapLabel = this.add.text(miniMapX + 5, miniMapY + 5, 'Mini Map', {
    fontSize: '12px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 4, y: 2 }
  });
  miniMapLabel.setScrollFactor(0);
  miniMapLabel.setDepth(1001);

  // 状态显示
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  statusText.setScrollFactor(0);
  statusText.setDepth(1000);

  // 更新状态文本
  this.events.on('update', () => {
    gameState.playerX = Math.floor(player.x);
    gameState.playerY = Math.floor(player.y);
    statusText.setText([
      `Level: ${gameState.level}`,
      `Score: ${gameState.score}`,
      `Pos: (${gameState.playerX}, ${gameState.playerY})`
    ]);
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文本
  const instructions = this.add.text(10, 80, 'Use Arrow Keys to Move\nSpeed: 300 px/s', {
    fontSize: '14px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  instructions.setScrollFactor(0);
  instructions.setDepth(1000);

  console.log('Game initialized - Main camera follows player, mini-map in top-right corner');
}

function update(time, delta) {
  // 玩家移动控制（速度 300）
  const speed = 300;

  player.setVelocity(0);

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

  // 对角线移动速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * 0.707,
      player.body.velocity.y * 0.707
    );
  }

  // 增加分数（基于移动距离）
  if (player.body.velocity.length() > 0) {
    gameState.score += Math.floor(player.body.velocity.length() * delta / 1000);
  }
}

function createBackground(scene, width, height) {
  const graphics = scene.add.graphics();
  
  // 绘制背景色
  graphics.fillStyle(0x1a1a2e, 1);
  graphics.fillRect(0, 0, width, height);

  // 绘制网格
  graphics.lineStyle(1, 0x16213e, 0.5);
  const gridSize = 100;

  for (let x = 0; x <= width; x += gridSize) {
    graphics.lineBetween(x, 0, x, height);
  }

  for (let y = 0; y <= height; y += gridSize) {
    graphics.lineBetween(0, y, width, y);
  }
}

function createObstacles(scene, worldWidth, worldHeight) {
  // 生成障碍物纹理
  const obstacleGraphics = scene.add.graphics();
  obstacleGraphics.fillStyle(0xff6b6b, 1);
  obstacleGraphics.fillRect(0, 0, 60, 60);
  obstacleGraphics.generateTexture('obstacle', 60, 60);
  obstacleGraphics.destroy();

  // 固定种子生成障碍物位置（确保确定性）
  const seed = 12345;
  const random = new Phaser.Math.RandomDataGenerator([seed]);

  const obstacleCount = 20;
  for (let i = 0; i < obstacleCount; i++) {
    const x = random.between(100, worldWidth - 100);
    const y = random.between(100, worldHeight - 100);
    
    // 避免在玩家初始位置附近生成障碍物
    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;
    const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);
    
    if (distance > 200) {
      const obstacle = scene.add.rectangle(x, y, 60, 60, 0xff6b6b);
      obstacles.add(obstacle);
    }
  }

  // 添加边界标记
  const borderGraphics = scene.add.graphics();
  borderGraphics.lineStyle(5, 0xffd93d, 1);
  borderGraphics.strokeRect(0, 0, worldWidth, worldHeight);
}

new Phaser.Game(config);