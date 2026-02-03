const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
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

let player;
let platforms;
let cursors;
let spaceKey;
let jumpCount = 0; // 状态信号：当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let jumpText;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('player', 32, 48);
  graphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 64);
  groundGraphics.generateTexture('ground', 800, 64);
  groundGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x666666, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();

  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  platforms.create(400, 584, 'ground');

  // 添加几个平台供测试
  platforms.create(600, 400, 'platform').setScale(0.5).refreshBody();
  platforms.create(200, 300, 'platform').setScale(0.5).refreshBody();
  platforms.create(400, 200, 'platform').setScale(0.5).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置玩家与平台碰撞
  this.physics.add.collider(player, platforms, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加状态显示文本
  jumpText = this.add.text(16, 16, 'Jumps: 0/2', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 50, 'Press SPACE to jump (double jump allowed)\nArrow keys to move', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 检测玩家是否在地面上
  const onGround = player.body.touching.down;

  // 如果在地面上，重置跳跃次数
  if (onGround && jumpCount > 0) {
    jumpCount = 0;
    updateJumpText();
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(-120);
      jumpCount++;
      updateJumpText();
    }
  }
}

function onPlayerLand(player, platform) {
  // 碰撞回调函数（可用于额外逻辑）
}

function updateJumpText() {
  jumpText.setText(`Jumps: ${jumpCount}/${maxJumps}`);
}

const game = new Phaser.Game(config);