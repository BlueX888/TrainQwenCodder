const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
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

// 游戏状态变量
let player;
let platforms;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前跳跃次数
let maxJumps = 2; // 最大跳跃次数
let statusText;
let isGrounded = false; // 是否在地面

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x654321, 1);
  groundGraphics.fillRect(0, 0, 800, 32);
  groundGraphics.generateTexture('ground', 800, 32);
  groundGraphics.destroy();

  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  platforms.create(400, 584, 'ground').setScale(1).refreshBody();

  // 添加几个平台
  platforms.create(600, 400, 'platform').setScale(0.5, 1).refreshBody();
  platforms.create(50, 250, 'platform').setScale(0.4, 1).refreshBody();
  platforms.create(750, 220, 'platform').setScale(0.3, 1).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, platforms, onGroundContact, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 560, '使用 ↑ 或 空格键 跳跃（可双跳）', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 水平移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 检测是否在地面（通过速度判断）
  const wasGrounded = isGrounded;
  isGrounded = player.body.touching.down;

  // 如果刚落地，重置跳跃次数
  if (isGrounded && !wasGrounded) {
    jumpCount = 0;
  }

  // 跳跃逻辑 - 检测按键刚按下（使用JustDown避免长按连续触发）
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(-160);
      jumpCount++;
    }
  }

  updateStatusText();
}

// 碰撞回调函数
function onGroundContact(player, platform) {
  // 这个函数在每帧碰撞时都会调用
}

// 更新状态文本
function updateStatusText() {
  const jumpsRemaining = maxJumps - jumpCount;
  statusText.setText([
    `跳跃次数: ${jumpCount}/${maxJumps}`,
    `剩余跳跃: ${jumpsRemaining}`,
    `在地面: ${isGrounded ? '是' : '否'}`,
    `速度Y: ${Math.round(player.body.velocity.y)}`
  ]);
}

new Phaser.Game(config);