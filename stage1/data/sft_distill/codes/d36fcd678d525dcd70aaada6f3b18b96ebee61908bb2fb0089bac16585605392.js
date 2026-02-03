const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#87CEEB'
};

// 游戏状态变量
let player;
let platforms;
let cursors;
let jumpCount = 0; // 可验证的状态信号：记录跳跃次数
let isGrounded = false;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（棕色矩形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platform', 200, 32);
  platformGraphics.destroy();

  // 创建地面纹理（深棕色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x654321, 1);
  groundGraphics.fillRect(0, 0, 800, 64);
  groundGraphics.generateTexture('ground', 800, 64);
  groundGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  platforms.create(400, 584, 'ground').setScale(1).refreshBody();

  // 添加多个平台
  platforms.create(600, 450, 'platform');
  platforms.create(50, 350, 'platform');
  platforms.create(400, 250, 'platform');
  platforms.create(700, 200, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0); // 不反弹
  player.setCollideWorldBounds(true); // 限制在世界边界内

  // 设置玩家与平台的碰撞
  this.physics.add.collider(player, platforms, () => {
    // 碰撞回调：检测是否着地
    if (player.body.touching.down) {
      isGrounded = true;
    }
  });

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加空格键用于跳跃
  this.input.keyboard.on('keydown-SPACE', () => {
    if (isGrounded) {
      player.setVelocityY(-400); // 跳跃速度
      jumpCount++; // 记录跳跃次数
      isGrounded = false;
      console.log('Jump count:', jumpCount);
    }
  });

  // 显示状态信息
  const statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  statusText.setScrollFactor(0);
  statusText.setDepth(100);

  // 更新状态文本
  this.events.on('update', () => {
    statusText.setText([
      `Jump Count: ${jumpCount}`,
      `Position: (${Math.round(player.x)}, ${Math.round(player.y)})`,
      `Grounded: ${isGrounded}`,
      `Velocity: ${Math.round(player.body.velocity.x)}`
    ]);
  });
}

function update(time, delta) {
  // 检测玩家是否在地面上（用于跳跃判断）
  if (player.body.touching.down) {
    isGrounded = true;
  } else {
    isGrounded = false;
  }

  // 左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-360); // 向左移动，速度 360
  } else if (cursors.right.isDown) {
    player.setVelocityX(360); // 向右移动，速度 360
  } else {
    // 没有按键时停止水平移动
    player.setVelocityX(0);
  }

  // 跳跃控制（方向键上）
  if (cursors.up.isDown && isGrounded) {
    player.setVelocityY(-400);
    jumpCount++;
    isGrounded = false;
    console.log('Jump count:', jumpCount);
  }
}

// 启动游戏
const game = new Phaser.Game(config);