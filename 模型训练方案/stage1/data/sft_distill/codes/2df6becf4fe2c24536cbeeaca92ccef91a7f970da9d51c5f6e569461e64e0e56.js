// 双跳功能实现
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
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

let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let statusText;
let jumpForce = -200; // 跳跃力度（负值向上）

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建地面
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 550, 800, 50);
  groundGraphics.generateTexture('groundTex', 800, 50);
  groundGraphics.destroy();

  ground = this.physics.add.staticImage(400, 575, 'groundTex');

  // 创建玩家
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('playerTex', 40, 40);
  playerGraphics.destroy();

  player = this.physics.add.sprite(100, 450, 'playerTex');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground, () => {
    // 玩家着地时重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
      updateStatusText();
    }
  });

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态文本显示
  statusText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 添加说明文本
  this.add.text(16, 60, '按 SPACE 或 UP 跳跃\n可在空中再跳一次', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加左右移动平台用于测试
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platformTex', 150, 20);
  platformGraphics.destroy();

  const platform1 = this.physics.add.staticImage(300, 400, 'platformTex');
  const platform2 = this.physics.add.staticImage(500, 300, 'platformTex');
  
  this.physics.add.collider(player, platform1, () => {
    if (player.body.touching.down) {
      jumpCount = 0;
      updateStatusText();
    }
  });
  
  this.physics.add.collider(player, platform2, () => {
    if (player.body.touching.down) {
      jumpCount = 0;
      updateStatusText();
    }
  });
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(jumpForce);
      jumpCount++;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  const remainingJumps = maxJumps - jumpCount;
  statusText.setText(`剩余跳跃次数: ${remainingJumps}/${maxJumps}`);
  
  // 改变文本颜色提示
  if (remainingJumps === 0) {
    statusText.setStyle({ fill: '#ff0000' });
  } else if (remainingJumps === 1) {
    statusText.setStyle({ fill: '#ff8800' });
  } else {
    statusText.setStyle({ fill: '#000' });
  }
}

new Phaser.Game(config);