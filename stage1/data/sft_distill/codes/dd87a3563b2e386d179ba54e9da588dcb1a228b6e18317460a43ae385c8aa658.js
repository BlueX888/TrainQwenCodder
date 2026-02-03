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
  },
  backgroundColor: '#87CEEB'
};

// 状态变量（用于验证）
let jumpCount = 0;
let isGrounded = false;

let player;
let platforms;
let cursors;
let statusText;

function preload() {
  // 创建角色纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面平台
  platforms.create(200, 568, 'platform');
  platforms.create(600, 568, 'platform');
  
  // 添加中间平台
  platforms.create(400, 450, 'platform').setScale(0.6).refreshBody();
  platforms.create(100, 350, 'platform').setScale(0.5).refreshBody();
  platforms.create(700, 350, 'platform').setScale(0.5).refreshBody();

  // 创建玩家角色
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.collider(player, platforms, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 检测是否在地面上
  isGrounded = player.body.touching.down;

  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只有在地面上才能跳跃）
  if (cursors.up.isDown && isGrounded) {
    player.setVelocityY(-400);
    jumpCount++;
    updateStatusText();
  }

  updateStatusText();
}

function onPlayerLand(player, platform) {
  // 碰撞回调函数（可选）
}

function updateStatusText() {
  const velocityX = Math.round(player.body.velocity.x);
  const velocityY = Math.round(player.body.velocity.y);
  const posX = Math.round(player.x);
  const posY = Math.round(player.y);
  
  statusText.setText([
    `Jump Count: ${jumpCount}`,
    `Position: (${posX}, ${posY})`,
    `Velocity: (${velocityX}, ${velocityY})`,
    `On Ground: ${isGrounded ? 'Yes' : 'No'}`,
    '',
    'Controls: Arrow Keys to Move & Jump'
  ]);
}

new Phaser.Game(config);