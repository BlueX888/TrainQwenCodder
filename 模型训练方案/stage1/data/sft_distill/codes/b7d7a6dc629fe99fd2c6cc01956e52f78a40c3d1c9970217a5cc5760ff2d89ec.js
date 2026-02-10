const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
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
let player;
let platform;
let cursors;
let platformDirection = 1; // 1 为右移，-1 为左移
let platformSpeed = 300;
let platformLeftBound = 100;
let platformRightBound = 600;

// 状态信号变量
let gameState = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformDirection: 1,
  isPlayerOnPlatform: false,
  frameCount: 0
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 创建粉色平台纹理
  graphics.fillStyle(0xFF69B4, 1); // 粉色
  graphics.fillRect(0, 0, 200, 30);
  graphics.generateTexture('platformTex', 200, 30);
  graphics.clear();
  
  // 创建玩家纹理（蓝色方块）
  graphics.fillStyle(0x0000FF, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerTex', 40, 40);
  graphics.clear();
  
  // 创建地面（静态）
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(0, 0, 800, 50);
  graphics.generateTexture('groundTex', 800, 50);
  graphics.destroy();
  
  // 创建地面
  const ground = this.physics.add.sprite(400, 575, 'groundTex');
  ground.setImmovable(true);
  ground.body.allowGravity = false;
  
  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platformTex');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.body.setVelocityX(platformSpeed * platformDirection);
  
  // 创建玩家
  player = this.physics.add.sprite(400, 100, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  
  // 添加碰撞检测
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, null, null, this);
  
  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  // 初始化状态
  updateGameState();
}

function update(time, delta) {
  gameState.frameCount++;
  
  // 平台移动逻辑
  if (platform.x <= platformLeftBound) {
    platformDirection = 1;
    platform.body.setVelocityX(platformSpeed * platformDirection);
  } else if (platform.x >= platformRightBound) {
    platformDirection = -1;
    platform.body.setVelocityX(platformSpeed * platformDirection);
  }
  
  // 检测玩家是否在平台上
  const isOnPlatform = player.body.touching.down && platform.body.touching.up;
  gameState.isPlayerOnPlatform = isOnPlatform;
  
  // 如果玩家在平台上，让玩家跟随平台移动
  if (isOnPlatform) {
    player.x += platform.body.velocity.x * (delta / 1000);
  }
  
  // 玩家左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }
  
  // 跳跃控制
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
  
  // 更新状态变量
  updateGameState();
  
  // 更新状态显示
  this.statusText.setText([
    `Frame: ${gameState.frameCount}`,
    `Player: (${Math.round(gameState.playerX)}, ${Math.round(gameState.playerY)})`,
    `Platform: (${Math.round(gameState.platformX)}, 400)`,
    `Direction: ${gameState.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
    `On Platform: ${gameState.isPlayerOnPlatform ? 'YES' : 'NO'}`,
    `Platform Speed: ${platformSpeed}`
  ].join('\n'));
}

function updateGameState() {
  gameState.playerX = player.x;
  gameState.playerY = player.y;
  gameState.platformX = platform.x;
  gameState.platformDirection = platformDirection;
}

// 启动游戏
const game = new Phaser.Game(config);