const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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

let player;
let platform;
let cursors;
let platformDirection = 1; // 状态信号：1表示向右，-1表示向左
let platformSpeed = 300;
let platformMinX = 100;
let platformMaxX = 600;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（白色长方形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0xffffff, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建地面纹理（灰色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x666666, 1);
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('ground', 800, 40);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  const ground = this.physics.add.sprite(400, 580, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(platformSpeed * platformDirection);

  // 创建玩家
  player = this.physics.add.sprite(400, 100, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0.1);

  // 设置碰撞
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, null, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(16, 16, 'Arrow Keys to Move\nPlatform moves at 300 speed', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加状态显示
  this.statusText = this.add.text(16, 70, '', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function update() {
  // 更新平台移动逻辑
  if (platform.x <= platformMinX) {
    platformDirection = 1;
    platform.setVelocityX(platformSpeed * platformDirection);
  } else if (platform.x >= platformMaxX) {
    platformDirection = -1;
    platform.setVelocityX(platformSpeed * platformDirection);
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 当玩家站在平台上时，跟随平台移动
  if (player.body.touching.down && platform.body.touching.up) {
    // 玩家会自动跟随平台，因为物理引擎处理了碰撞
    player.x += platform.body.velocity.x * (1/60); // 补偿移动
  }

  // 更新状态显示
  const direction = platformDirection === 1 ? 'RIGHT' : 'LEFT';
  const onPlatform = player.body.touching.down && platform.body.touching.up;
  this.statusText.setText(
    `Platform Direction: ${direction}\n` +
    `Platform Position: ${Math.round(platform.x)}\n` +
    `Player on Platform: ${onPlatform}`
  );
}

const game = new Phaser.Game(config);