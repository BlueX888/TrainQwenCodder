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

// 游戏状态变量
let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let jumpPower = -200; // 跳跃力度
let statusText;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建地面
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x4a4a4a, 1);
  groundGraphics.fillRect(0, 550, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  ground = this.physics.add.staticSprite(400, 575, 'groundTex');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建玩家角色
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 50);
  // 添加眼睛使角色更生动
  playerGraphics.fillStyle(0x000000, 1);
  playerGraphics.fillCircle(12, 15, 4);
  playerGraphics.fillCircle(28, 15, 4);
  playerGraphics.generateTexture('playerTex', 40, 50);
  playerGraphics.destroy();

  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, () => {
    // 当玩家与地面接触时，重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
    }
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加状态文本显示
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 50, '按空格键跳跃（最多2次）\n方向键左右移动', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 水平移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 双跳逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    // 检查是否还能跳跃
    if (jumpCount < maxJumps) {
      player.setVelocityY(jumpPower);
      jumpCount++;
      updateStatusText();
      
      // 添加视觉反馈 - 跳跃时改变颜色
      if (jumpCount === 1) {
        player.setTint(0xffff00); // 第一次跳跃变黄色
      } else if (jumpCount === 2) {
        player.setTint(0xff8800); // 第二次跳跃变橙色
      }
    }
  }

  // 检测玩家是否在地面上，重置颜色
  if (player.body.touching.down && jumpCount === 0) {
    player.clearTint();
  }

  // 更新状态显示
  updateStatusText();
}

function updateStatusText() {
  const remainingJumps = maxJumps - jumpCount;
  const onGround = player && player.body && player.body.touching.down;
  
  statusText.setText(
    `跳跃次数: ${jumpCount}/${maxJumps}\n` +
    `剩余跳跃: ${remainingJumps}\n` +
    `是否在地面: ${onGround ? '是' : '否'}\n` +
    `速度Y: ${player ? Math.round(player.body.velocity.y) : 0}`
  );
}

new Phaser.Game(config);