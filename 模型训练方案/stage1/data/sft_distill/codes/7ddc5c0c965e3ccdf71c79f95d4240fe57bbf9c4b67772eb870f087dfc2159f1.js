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
  scene: { preload, create, update }
};

let player;
let platforms;
let cursors;
let jumpKey;
let jumpCount = 0; // 当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let statusText;

function preload() {
  // 使用Graphics生成纹理，无需外部资源
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
  platformGraphics.fillStyle(0x666666, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();

  // 创建地面平台组
  platforms = this.physics.add.staticGroup();
  
  // 地面
  platforms.create(400, 568, 'platform').setScale(2).refreshBody();
  
  // 其他平台
  platforms.create(600, 400, 'platform');
  platforms.create(50, 250, 'platform').setScale(0.5).refreshBody();
  platforms.create(750, 220, 'platform').setScale(0.5).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms, () => {
    // 当玩家接触地面时，重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
    }
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态文本显示
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文字
  this.add.text(16, 50, '按空格键或上方向键跳跃\n最多可连续跳跃2次', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 双跳逻辑
  // 检测跳跃键是否刚按下（使用 justDown 避免长按连续触发）
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(jumpKey)) {
    // 如果跳跃次数小于最大跳跃次数，允许跳跃
    if (jumpCount < maxJumps) {
      player.setVelocityY(-240);
      jumpCount++;
    }
  }

  // 当玩家接触地面时，重置跳跃次数
  if (player.body.touching.down) {
    jumpCount = 0;
  }

  // 更新状态显示
  const remainingJumps = maxJumps - jumpCount;
  const onGround = player.body.touching.down ? '是' : '否';
  statusText.setText(
    `剩余跳跃次数: ${remainingJumps}/${maxJumps}\n` +
    `已使用跳跃: ${jumpCount}\n` +
    `是否在地面: ${onGround}\n` +
    `Y速度: ${Math.round(player.body.velocity.y)}`
  );
}

new Phaser.Game(config);