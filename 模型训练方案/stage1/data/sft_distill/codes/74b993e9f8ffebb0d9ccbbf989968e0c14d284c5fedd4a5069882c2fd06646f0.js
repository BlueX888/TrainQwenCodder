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

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 64);
  groundGraphics.generateTexture('ground', 800, 64);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticGroup();
  ground.create(400, 568, 'ground');

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加玩家与地面的碰撞
  this.physics.add.collider(player, ground, onPlayerLand, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 空格键按下事件（使用justDown避免长按连续触发）
  spaceKey.on('down', () => {
    handleJump();
  });

  // 添加状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 50, '按空格键跳跃（可双跳）', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
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

  // 检测玩家是否在地面上（通过速度判断）
  if (player.body.touching.down && player.body.velocity.y === 0) {
    // 玩家着地，重置跳跃次数
    if (jumpCount > 0) {
      jumpCount = 0;
      updateStatusText();
    }
  }

  updateStatusText();
}

function handleJump() {
  // 检查是否还能跳跃
  if (jumpCount < MAX_JUMPS) {
    player.setVelocityY(-160);
    jumpCount++;
    updateStatusText();
  }
}

function onPlayerLand(player, ground) {
  // 碰撞回调（可用于额外逻辑）
}

function updateStatusText() {
  const remainingJumps = MAX_JUMPS - jumpCount;
  const status = player.body.touching.down ? '着地' : '空中';
  statusText.setText(
    `剩余跳跃次数: ${remainingJumps}/${MAX_JUMPS} | 状态: ${status} | 已跳跃: ${jumpCount}次`
  );
}

new Phaser.Game(config);