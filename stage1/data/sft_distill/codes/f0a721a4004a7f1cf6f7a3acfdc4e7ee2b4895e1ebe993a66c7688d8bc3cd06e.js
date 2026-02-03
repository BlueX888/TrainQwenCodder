const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
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

let player;
let platforms;
let cursors;
let spaceKey;
let jumpCount = 0; // 可验证的状态信号
let isGrounded = false;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platform', 200, 32);
  platformGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x654321, 1);
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('ground', 800, 40);
  groundGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  platforms.create(400, 580, 'ground').setScale(1).refreshBody();

  // 添加多个平台
  platforms.create(600, 450, 'platform');
  platforms.create(200, 350, 'platform');
  platforms.create(500, 250, 'platform');
  platforms.create(100, 150, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置玩家与平台的碰撞
  this.physics.add.collider(player, platforms, () => {
    isGrounded = true;
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加文本显示状态
  this.add.text(16, 16, 'Use Arrow Keys to Move, Space to Jump', {
    fontSize: '18px',
    fill: '#000'
  });

  this.jumpText = this.add.text(16, 40, 'Jumps: 0', {
    fontSize: '18px',
    fill: '#000'
  });

  this.statusText = this.add.text(16, 64, 'Status: Grounded', {
    fontSize: '18px',
    fill: '#000'
  });
}

function update() {
  // 重置接地状态
  const touchingDown = player.body.touching.down;
  
  if (touchingDown) {
    isGrounded = true;
  }

  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey) && isGrounded) {
    player.setVelocityY(-500);
    jumpCount++;
    isGrounded = false;
    this.jumpText.setText('Jumps: ' + jumpCount);
  }

  // 更新状态文本
  if (touchingDown) {
    this.statusText.setText('Status: Grounded');
  } else {
    this.statusText.setText('Status: Airborne');
  }
}

const game = new Phaser.Game(config);