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

let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已使用的跳跃次数
let maxJumps = 2; // 最大跳跃次数
let totalJumps = 0; // 总跳跃计数（用于验证）
let statusText;
let jumpForce = -360;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建地面
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 550, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  ground = this.physics.add.staticSprite(400, 575, 'groundTex');
  ground.setDisplaySize(800, 50);
  ground.refreshBody();

  // 创建玩家角色（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000FF, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('playerTex', 40, 40);
  playerGraphics.destroy();

  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(true);
  player.setBounce(0);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();

  // 添加说明文本
  this.add.text(16, 60, '按 空格键 或 ↑ 进行跳跃\n最多可连续跳跃2次', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
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

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(jumpForce);
      jumpCount++;
      totalJumps++;
      updateStatusText();
      
      // 视觉反馈：跳跃时稍微改变颜色
      player.setTint(jumpCount === 1 ? 0x6666FF : 0x9999FF);
    }
  }

  // 检测是否在空中（用于更精确的跳跃次数控制）
  if (player.body.touching.down) {
    if (jumpCount > 0) {
      // 刚落地，重置跳跃次数
      jumpCount = 0;
      player.clearTint();
      updateStatusText();
    }
  }
}

function onPlayerLand(player, ground) {
  // 碰撞回调：确保落地时重置跳跃次数
  if (jumpCount > 0) {
    jumpCount = 0;
    player.clearTint();
    updateStatusText();
  }
}

function updateStatusText() {
  const remainingJumps = maxJumps - jumpCount;
  statusText.setText(
    `剩余跳跃次数: ${remainingJumps}/${maxJumps}\n` +
    `总跳跃计数: ${totalJumps}`
  );
}

const game = new Phaser.Game(config);