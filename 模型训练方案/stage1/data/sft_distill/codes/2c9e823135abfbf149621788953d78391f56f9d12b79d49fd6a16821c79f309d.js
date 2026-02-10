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
let jumpCount = 0; // 跳跃次数计数器
const MAX_JUMPS = 2; // 最大跳跃次数
let statusText;
let jumpForce = -160; // 跳跃力度

function preload() {
  // 创建角色纹理（蓝色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建地面纹理（绿色长方形）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x00ff00, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.sprite(400, 575, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onGroundCollision, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态文本显示
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 空格键按下事件
  spaceKey.on('down', () => {
    performJump();
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

  // 检测是否在空中（用于调试显示）
  updateStatusText();
}

function performJump() {
  // 双跳逻辑：只要跳跃次数未达到最大值就可以跳
  if (jumpCount < MAX_JUMPS) {
    player.setVelocityY(jumpForce);
    jumpCount++;
    updateStatusText();
  }
}

function onGroundCollision() {
  // 当玩家接触地面时，重置跳跃次数
  if (player.body.touching.down && ground.body.touching.up) {
    jumpCount = 0;
    updateStatusText();
  }
}

function updateStatusText() {
  const isOnGround = player.body.touching.down;
  const remainingJumps = MAX_JUMPS - jumpCount;
  
  statusText.setText([
    `Jump Count: ${jumpCount}/${MAX_JUMPS}`,
    `Remaining Jumps: ${remainingJumps}`,
    `On Ground: ${isOnGround}`,
    `Velocity Y: ${Math.round(player.body.velocity.y)}`,
    '',
    'Controls:',
    'SPACE - Jump (can jump twice)',
    'LEFT/RIGHT - Move'
  ]);
}

const game = new Phaser.Game(config);