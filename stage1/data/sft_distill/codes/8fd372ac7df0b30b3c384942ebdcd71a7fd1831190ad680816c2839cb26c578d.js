const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
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
let platformDirectionChanges = 0; // 平台方向改变次数
let player;
let platform;
let platformSpeed = 120;
let platformMinX = 100;
let platformMaxX = 600;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x0000ff, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();
}

function create() {
  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platform');
  platform.setImmovable(true); // 平台不受碰撞影响
  platform.body.allowGravity = false; // 平台不受重力影响
  platform.setVelocityX(platformSpeed); // 设置初始速度

  // 创建玩家
  player = this.physics.add.sprite(300, 200, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, platform, null, null, this);

  // 添加键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加说明文本
  this.add.text(10, 550, 'Use Arrow Keys to move. Stand on the blue platform!', {
    fontSize: '14px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 更新状态显示
  this.statusText.setText([
    `Platform Direction Changes: ${platformDirectionChanges}`,
    `Player Y: ${Math.floor(player.y)}`,
    `Platform X: ${Math.floor(platform.x)}`,
    `On Platform: ${player.body.touching.down && platform.body.touching.up}`
  ]);

  // 平台往返移动逻辑
  if (platform.x >= platformMaxX && platform.body.velocity.x > 0) {
    platform.setVelocityX(-platformSpeed);
    platformDirectionChanges++;
  } else if (platform.x <= platformMinX && platform.body.velocity.x < 0) {
    platform.setVelocityX(platformSpeed);
    platformDirectionChanges++;
  }

  // 玩家控制
  if (this.cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家站在平台上，跟随平台移动
    if (player.body.touching.down && platform.body.touching.up) {
      player.setVelocityX(platform.body.velocity.x);
    } else {
      player.setVelocityX(0);
    }
  }

  // 跳跃控制
  if (this.cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}

const game = new Phaser.Game(config);