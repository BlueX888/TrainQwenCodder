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

// 可验证的状态信号
let jumpCount = 0;  // 记录跳跃次数
let isOnGround = false;  // 是否在地面上
let playerX = 0;  // 玩家X坐标
let playerY = 0;  // 玩家Y坐标

let player;
let platforms;
let cursors;

function preload() {
  // 使用 Graphics 创建玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('player', 32, 48);
  graphics.destroy();

  // 创建地面纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8b4513, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('ground', 400, 32);
  platformGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面平台
  platforms.create(200, 568, 'ground');
  platforms.create(600, 568, 'ground');
  
  // 添加中间平台
  platforms.create(400, 400, 'ground').setScale(0.5).refreshBody();
  platforms.create(100, 300, 'ground').setScale(0.4).refreshBody();
  platforms.create(700, 300, 'ground').setScale(0.4).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置玩家与平台的碰撞
  this.physics.add.collider(player, platforms, () => {
    isOnGround = true;
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 重置地面状态（每帧检测）
  if (player.body.touching.down) {
    isOnGround = true;
  } else {
    isOnGround = false;
  }

  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-80);
  } else if (cursors.right.isDown) {
    player.setVelocityX(80);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只能在地面上跳跃）
  if (cursors.up.isDown && isOnGround) {
    player.setVelocityY(-330);
    jumpCount++;
  }

  // 更新状态变量
  playerX = Math.round(player.x);
  playerY = Math.round(player.y);

  // 更新状态显示
  this.statusText.setText([
    `Jump Count: ${jumpCount}`,
    `On Ground: ${isOnGround}`,
    `Position: (${playerX}, ${playerY})`,
    `Velocity: (${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)})`
  ]);
}

const game = new Phaser.Game(config);