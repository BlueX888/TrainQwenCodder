const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
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
let ground;

// 状态信号变量
let platformDirection = 1; // 1表示向右，-1表示向左
let platformSpeed = 300;
let platformLeftBound = 100;
let platformRightBound = 600;

function preload() {
  // 创建黄色平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0xFFFF00, 1); // 黄色
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platform', 150, 20);
  platformGraphics.destroy();

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000FF, 1); // 蓝色
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理（绿色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x00AA00, 1); // 绿色
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.sprite(400, 575, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(platformSpeed * platformDirection);

  // 创建玩家
  player = this.physics.add.sprite(300, 200, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, null, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示状态
  this.statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000'
  });
}

function update() {
  // 更新平台移动逻辑
  if (platform.x <= platformLeftBound) {
    platformDirection = 1;
    platform.setVelocityX(platformSpeed * platformDirection);
  } else if (platform.x >= platformRightBound) {
    platformDirection = -1;
    platform.setVelocityX(platformSpeed * platformDirection);
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家站在平台上，保持平台的水平速度
    if (player.body.touching.down && platform.body.touching.up) {
      player.setVelocityX(platform.body.velocity.x);
    } else {
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
    `Platform Position: ${Math.round(platform.x)}`,
    `Player Position: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    `On Platform: ${player.body.touching.down && platform.body.touching.up ? 'YES' : 'NO'}`,
    `Controls: Arrow Keys to Move, UP to Jump`
  ]);
}

new Phaser.Game(config);