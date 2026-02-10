const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
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
let jumpCount = 0; // 当前已跳跃次数
let totalJumps = 0; // 总跳跃次数（用于验证）
let statusText;
let jumpForce = -400; // 跳跃力度（负值向上）
const MAX_JUMPS = 2; // 最大跳跃次数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建地面
  const graphics = this.add.graphics();
  graphics.fillStyle(0x228B22, 1);
  graphics.fillRect(0, 550, 800, 50);
  graphics.generateTexture('ground', 800, 50);
  graphics.destroy();

  ground = this.physics.add.staticImage(400, 575, 'ground');

  // 创建玩家角色
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();

  // 添加说明文本
  this.add.text(16, 60, '按空格键跳跃（可连续跳两次）', {
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

  // 跳跃控制（双跳）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(jumpForce);
      jumpCount++;
      totalJumps++;
      updateStatusText();
    }
  }

  // 检测是否在地面上（通过速度判断）
  // 如果玩家向下移动且速度接近0，说明即将着地
  if (player.body.touching.down && player.body.velocity.y === 0) {
    if (jumpCount > 0) {
      jumpCount = 0;
      updateStatusText();
    }
  }
}

// 玩家着地回调
function onPlayerLand(player, ground) {
  // 重置跳跃计数
  if (jumpCount > 0) {
    jumpCount = 0;
    updateStatusText();
  }
}

// 更新状态文本
function updateStatusText() {
  const remainingJumps = MAX_JUMPS - jumpCount;
  statusText.setText(
    `剩余跳跃: ${remainingJumps}/${MAX_JUMPS} | 总跳跃次数: ${totalJumps}`
  );
}

new Phaser.Game(config);