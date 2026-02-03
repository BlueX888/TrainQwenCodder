const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  platformX: 0,
  platformY: 0,
  platformVelocity: 0,
  playerX: 0,
  playerY: 0,
  playerOnPlatform: false,
  frameCount: 0
};

let player;
let platform;
let cursors;
let ground;
const PLATFORM_SPEED = 240;
const PLATFORM_MIN_X = 100;
const PLATFORM_MAX_X = 600;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 生成黄色平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0xFFFF00, 1); // 黄色
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platformTex', 150, 20);
  platformGraphics.destroy();

  // 生成蓝色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000FF, 1); // 蓝色
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('playerTex', 32, 48);
  playerGraphics.destroy();

  // 生成灰色地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x808080, 1); // 灰色
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('groundTex', 800, 40);
  groundGraphics.destroy();

  // 创建地面（静态平台）
  ground = this.physics.add.sprite(400, 580, 'groundTex');
  ground.body.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(300, 400, 'platformTex');
  platform.body.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(PLATFORM_SPEED);

  // 创建玩家
  player = this.physics.add.sprite(300, 200, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, platform, null, null, this);
  this.physics.add.collider(player, ground);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加调试文本
  this.debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
}

function update(time, delta) {
  // 更新帧计数
  window.__signals__.frameCount++;

  // 平台往返移动逻辑
  if (platform.x >= PLATFORM_MAX_X && platform.body.velocity.x > 0) {
    platform.setVelocityX(-PLATFORM_SPEED);
  } else if (platform.x <= PLATFORM_MIN_X && platform.body.velocity.x < 0) {
    platform.setVelocityX(PLATFORM_SPEED);
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家在平台上，保持平台的速度
    if (player.body.touching.down && platform.body.touching.up) {
      player.setVelocityX(platform.body.velocity.x);
    } else {
      player.setVelocityX(0);
    }
  }

  // 跳跃
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 检测玩家是否在平台上
  const onPlatform = player.body.touching.down && 
                     (platform.body.touching.up || ground.body.touching.up);

  // 更新信号
  window.__signals__.platformX = Math.round(platform.x * 100) / 100;
  window.__signals__.platformY = Math.round(platform.y * 100) / 100;
  window.__signals__.platformVelocity = platform.body.velocity.x;
  window.__signals__.playerX = Math.round(player.x * 100) / 100;
  window.__signals__.playerY = Math.round(player.y * 100) / 100;
  window.__signals__.playerOnPlatform = onPlatform;

  // 更新调试文本
  this.debugText.setText([
    `Frame: ${window.__signals__.frameCount}`,
    `Platform: (${window.__signals__.platformX}, ${window.__signals__.platformY})`,
    `Platform Speed: ${window.__signals__.platformVelocity}`,
    `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
    `On Platform: ${window.__signals__.playerOnPlatform}`,
    ``,
    `Controls: Arrow Keys to Move, Up to Jump`
  ]);

  // 每100帧输出一次日志
  if (window.__signals__.frameCount % 100 === 0) {
    console.log(JSON.stringify(window.__signals__));
  }
}

const game = new Phaser.Game(config);