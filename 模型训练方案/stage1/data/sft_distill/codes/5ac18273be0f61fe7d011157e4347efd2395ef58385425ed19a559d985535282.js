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

// 状态信号变量
let gameState = {
  platformBounces: 0,      // 平台反弹次数
  playerX: 0,              // 玩家X坐标
  playerY: 0,              // 玩家Y坐标
  platformDirection: 1,    // 平台移动方向 (1: 右, -1: 左)
  isPlayerOnPlatform: false // 玩家是否在平台上
};

let player;
let platform;
let cursors;
let ground;

function preload() {
  // 创建紫色平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x9932CC, 1); // 紫色
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platformTex', 150, 20);
  platformGraphics.destroy();

  // 创建绿色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00FF00, 1); // 绿色
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('playerTex', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1); // 棕色
  groundGraphics.fillRect(0, 0, 800, 32);
  groundGraphics.generateTexture('groundTex', 800, 32);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.sprite(400, 584, 'groundTex');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(200, 400, 'platformTex');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(240); // 初始向右移动
  
  // 设置平台移动范围
  platform.minX = 100;
  platform.maxX = 700;

  // 创建玩家
  player = this.physics.add.sprite(400, 100, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, () => {
    gameState.isPlayerOnPlatform = true;
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 重置平台状态
  gameState.isPlayerOnPlatform = false;

  // 平台往返移动逻辑
  if (platform.x >= platform.maxX && platform.body.velocity.x > 0) {
    platform.setVelocityX(-240);
    gameState.platformBounces++;
    gameState.platformDirection = -1;
  } else if (platform.x <= platform.minX && platform.body.velocity.x < 0) {
    platform.setVelocityX(240);
    gameState.platformBounces++;
    gameState.platformDirection = 1;
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家在平台上，跟随平台移动
    if (this.physics.world.overlap(player, platform)) {
      const platformBottom = platform.y + platform.height / 2;
      const playerBottom = player.y + player.height / 2;
      
      // 检测玩家是否真的站在平台上（玩家底部接近平台顶部）
      if (Math.abs(playerBottom - platformBottom) < 5 && player.body.velocity.y >= 0) {
        player.setVelocityX(platform.body.velocity.x);
        gameState.isPlayerOnPlatform = true;
      } else {
        player.setVelocityX(0);
      }
    } else {
      player.setVelocityX(0);
    }
  }

  // 跳跃控制
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 更新状态变量
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);

  // 更新状态显示
  this.statusText.setText([
    `Platform Bounces: ${gameState.platformBounces}`,
    `Platform Direction: ${gameState.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
    `Player Position: (${gameState.playerX}, ${gameState.playerY})`,
    `On Platform: ${gameState.isPlayerOnPlatform}`,
    `Platform Speed: ${Math.abs(platform.body.velocity.x)}`,
    '',
    'Controls: Arrow Keys to Move, Up to Jump'
  ]);
}

const game = new Phaser.Game(config);