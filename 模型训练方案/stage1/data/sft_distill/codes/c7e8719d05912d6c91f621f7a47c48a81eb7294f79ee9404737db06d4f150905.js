const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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

// 状态信号
let platformDirection = 1; // 1: 向右, -1: 向左
let playerOnPlatform = false;
let platform;
let player;
let cursors;
let platformSpeed = 160;
let platformMinX = 100;
let platformMaxX = 600;

function preload() {
  // 创建红色平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0xff0000, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platformTex', 200, 32);
  platformGraphics.destroy();

  // 创建绿色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('playerTex', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x666666, 1);
  groundGraphics.fillRect(0, 0, 800, 32);
  groundGraphics.generateTexture('groundTex', 800, 32);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  const ground = this.physics.add.sprite(400, 584, 'groundTex');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platformTex');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(platformSpeed * platformDirection);

  // 创建玩家
  player = this.physics.add.sprite(300, 200, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, () => {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      playerOnPlatform = true;
    }
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 重置平台状态
  playerOnPlatform = false;

  // 平台移动逻辑：边界检测实现往返
  if (platform.x <= platformMinX && platformDirection === -1) {
    platformDirection = 1;
    platform.setVelocityX(platformSpeed * platformDirection);
  } else if (platform.x >= platformMaxX && platformDirection === 1) {
    platformDirection = -1;
    platform.setVelocityX(platformSpeed * platformDirection);
  }

  // 检测玩家是否在平台上
  if (player.body.touching.down && platform.body.touching.up) {
    playerOnPlatform = true;
    
    // 玩家跟随平台移动
    player.x += platform.body.velocity.x * (1/60);
  }

  // 玩家左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家在平台上，保持平台的速度
    if (!playerOnPlatform) {
      player.setVelocityX(0);
    }
  }

  // 跳跃控制
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 更新状态显示
  this.statusText.setText([
    `Platform Direction: ${platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
    `Platform X: ${Math.round(platform.x)}`,
    `Platform Velocity: ${platform.body.velocity.x}`,
    `Player On Platform: ${playerOnPlatform}`,
    `Player X: ${Math.round(player.x)}`,
    `Player Y: ${Math.round(player.y)}`,
    '',
    'Controls: Arrow Keys (Left/Right/Up to Jump)'
  ]);
}

const game = new Phaser.Game(config);