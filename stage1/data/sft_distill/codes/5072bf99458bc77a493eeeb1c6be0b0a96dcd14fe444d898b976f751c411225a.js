const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
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
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 可验证状态：当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let jumpStatusText;
let totalJumpsText;
let totalJumpsPerformed = 0; // 总跳跃次数统计

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建地面
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x2d5016, 1);
  groundGraphics.fillRect(0, 550, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  ground = this.physics.add.staticSprite(400, 575, 'groundTex');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建玩家角色（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0066ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('playerTex', 40, 40);
  playerGraphics.destroy();

  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground, () => {
    // 落地时重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
    }
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 显示状态文本
  jumpStatusText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  totalJumpsText = this.add.text(16, 56, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 96, '按空格键跳跃（可双跳）\n← → 移动', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 检测跳跃输入（使用 justDown 避免长按连续跳跃）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    // 检查是否还能跳跃
    if (jumpCount < maxJumps) {
      player.setVelocityY(-360); // 跳跃力度 360
      jumpCount++;
      totalJumpsPerformed++;
      updateStatusText();
    }
  }

  // 检测是否落地（用于重置跳跃次数）
  if (player.body.touching.down && jumpCount > 0) {
    jumpCount = 0;
    updateStatusText();
  }
}

function updateStatusText() {
  const remaining = maxJumps - jumpCount;
  jumpStatusText.setText(`跳跃状态: ${jumpCount}/${maxJumps} | 剩余: ${remaining}`);
  totalJumpsText.setText(`总跳跃次数: ${totalJumpsPerformed}`);
}

new Phaser.Game(config);