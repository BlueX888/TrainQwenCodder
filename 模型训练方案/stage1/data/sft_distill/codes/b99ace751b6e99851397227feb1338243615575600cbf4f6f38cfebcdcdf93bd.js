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
let jumpCount = 0; // 当前跳跃次数
let maxJumps = 2; // 最大跳跃次数
let totalJumps = 0; // 总跳跃计数（用于验证）
let statusText;
let isJumpKeyPressed = false; // 防止按键连续触发

function preload() {
  // 使用Graphics生成纹理，无需外部资源
}

function create() {
  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 0, 800, 100);
  groundGraphics.generateTexture('groundTex', 800, 100);
  groundGraphics.destroy();

  // 创建角色纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000FF, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('playerTex', 40, 40);
  playerGraphics.destroy();

  // 创建地面
  ground = this.physics.add.staticGroup();
  ground.create(400, 580, 'groundTex');

  // 创建角色
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground, onLanding, null, this);

  // 键盘输入
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
  this.add.text(16, 560, 'Press SPACE to jump (Double Jump Available)', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 5, y: 3 }
  });
}

function update() {
  // 水平移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃逻辑
  if (spaceKey.isDown && !isJumpKeyPressed) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(-160);
      jumpCount++;
      totalJumps++;
      isJumpKeyPressed = true;
      updateStatusText();
    }
  }

  // 检测按键释放
  if (spaceKey.isUp) {
    isJumpKeyPressed = false;
  }

  // 检测是否在空中（用于调试显示）
  updateStatusText();
}

function onLanding(player, ground) {
  // 当角色着地时重置跳跃次数
  if (player.body.touching.down) {
    jumpCount = 0;
  }
}

function updateStatusText() {
  const onGround = player.body.touching.down ? 'Yes' : 'No';
  statusText.setText(
    `Jumps Available: ${maxJumps - jumpCount}/${maxJumps}\n` +
    `Total Jumps: ${totalJumps}\n` +
    `On Ground: ${onGround}`
  );
}

new Phaser.Game(config);