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
let jumpCount = 0; // 当前已跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
let statusText;
let totalJumps = 0; // 总跳跃次数（用于验证状态）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  // 创建角色纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('playerTex', 40, 40);
  playerGraphics.destroy();

  // 创建地面
  ground = this.physics.add.sprite(400, 575, 'groundTex');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建角色
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态文本
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
  // 水平移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(-320); // 跳跃力度 (120 * 2.67 ≈ 320 for better feel)
      jumpCount++;
      totalJumps++;
      updateStatusText();
    }
  }

  // 更新状态文本（实时显示）
  updateStatusText();
}

function onPlayerLand(player, ground) {
  // 角色着地时重置跳跃计数
  if (player.body.touching.down && ground.body.touching.up) {
    jumpCount = 0;
    updateStatusText();
  }
}

function updateStatusText() {
  const canJump = jumpCount < MAX_JUMPS;
  const remainingJumps = MAX_JUMPS - jumpCount;
  
  statusText.setText([
    `剩余跳跃次数: ${remainingJumps}/${MAX_JUMPS}`,
    `总跳跃次数: ${totalJumps}`,
    `状态: ${canJump ? '可跳跃' : '需要落地'}`,
    `当前高度: ${Math.round(player.y)}`
  ]);
}

new Phaser.Game(config);