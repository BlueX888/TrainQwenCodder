const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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

// 全局状态变量（可验证）
let jumpCount = 0;
let maxJumps = 2;
let totalJumps = 0;
let isOnGround = false;

let player;
let ground;
let cursors;
let spaceKey;
let statusText;
let jumpCountText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x00aa00, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 40, 60);
  playerGraphics.generateTexture('playerTex', 40, 60);
  playerGraphics.destroy();

  // 创建地面（静态物理体）
  ground = this.physics.add.staticSprite(400, 575, 'groundTex');
  ground.refreshBody();

  // 创建玩家（动态物理体）
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.collider(player, ground, () => {
    // 玩家落地时重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
      isOnGround = true;
    }
  });

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  jumpCountText = this.add.text(16, 50, '', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 说明文本
  this.add.text(16, 90, '按空格键跳跃（可双跳）', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 初始化状态
  updateStatusText();
}

function update() {
  // 检测玩家是否在地面上
  const wasOnGround = isOnGround;
  isOnGround = player.body.touching.down;

  // 如果刚落地，重置跳跃次数
  if (!wasOnGround && isOnGround) {
    jumpCount = 0;
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    // 只要跳跃次数小于最大跳跃次数就可以跳
    if (jumpCount < maxJumps) {
      player.setVelocityY(-200); // 跳跃力度为 200
      jumpCount++;
      totalJumps++;
      updateStatusText();
    }
  }

  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 更新状态文本
  updateStatusText();
}

function updateStatusText() {
  const remainingJumps = maxJumps - jumpCount;
  const groundStatus = isOnGround ? '在地面' : '在空中';
  
  statusText.setText(`状态: ${groundStatus} | 总跳跃次数: ${totalJumps}`);
  jumpCountText.setText(`剩余跳跃次数: ${remainingJumps}/${maxJumps} (当前已跳: ${jumpCount})`);
}

new Phaser.Game(config);