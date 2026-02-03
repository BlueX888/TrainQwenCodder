const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
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
let jumpsRemaining = 2; // 剩余跳跃次数
let jumpCount = 0; // 总跳跃次数统计
let statusText;

function preload() {
  // 使用Graphics创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 使用Graphics创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticSprite(400, 575, 'ground');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0);

  // 设置玩家与地面的碰撞
  this.physics.add.collider(player, ground, () => {
    // 当玩家与地面接触时，重置跳跃次数
    if (player.body.touching.down) {
      jumpsRemaining = 2;
    }
  });

  // 添加键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 60, '按空格键跳跃（可双跳）\n左右方向键移动', {
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

  // 跳跃控制 - 使用 justDown 确保每次按键只触发一次
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpsRemaining > 0) {
      // 执行跳跃
      player.setVelocityY(-120);
      jumpsRemaining--;
      jumpCount++;
      updateStatusText();
    }
  }

  // 检测玩家是否在地面上，用于重置跳跃次数
  // 这是额外的保险机制，主要逻辑在碰撞回调中
  if (player.body.touching.down && player.body.velocity.y === 0) {
    if (jumpsRemaining !== 2) {
      jumpsRemaining = 2;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  statusText.setText(
    `跳跃次数剩余: ${jumpsRemaining}/2 | 总跳跃: ${jumpCount}`
  );
}

new Phaser.Game(config);