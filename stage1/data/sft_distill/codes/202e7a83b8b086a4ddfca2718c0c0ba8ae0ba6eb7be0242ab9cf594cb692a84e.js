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
let jumpKey;
let jumpCount = 0; // 当前已跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
const JUMP_VELOCITY = -160; // 跳跃速度
let statusText;
let isOnGround = false;

function preload() {
  // 创建角色纹理（绿色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建地面纹理（棕色矩形）
  const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 64);
  groundGraphics.generateTexture('ground', 800, 64);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.sprite(400, 568, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.collider(player, ground, () => {
    // 当玩家接触地面时，重置跳跃次数
    if (player.body.touching.down) {
      isOnGround = true;
      jumpCount = 0;
    }
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 50, '按空格键跳跃（可双跳）\n方向键左右移动', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 检测是否在地面上
  if (player.body.touching.down) {
    if (!isOnGround) {
      isOnGround = true;
      jumpCount = 0;
      updateStatusText();
    }
  } else {
    if (isOnGround) {
      isOnGround = false;
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

  // 跳跃逻辑（双跳）
  if (Phaser.Input.Keyboard.JustDown(jumpKey)) {
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(JUMP_VELOCITY);
      jumpCount++;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  const remainingJumps = MAX_JUMPS - jumpCount;
  const status = isOnGround ? '在地面' : '在空中';
  statusText.setText(
    `状态: ${status}\n` +
    `剩余跳跃次数: ${remainingJumps}/${MAX_JUMPS}\n` +
    `已使用跳跃: ${jumpCount}`
  );
}

new Phaser.Game(config);