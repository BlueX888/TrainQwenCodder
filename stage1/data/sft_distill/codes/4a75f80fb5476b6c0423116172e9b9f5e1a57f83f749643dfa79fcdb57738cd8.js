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
let jumpCount = 0; // 当前连续跳跃次数
let totalJumps = 0; // 总跳跃计数（状态信号）
let statusText;
let jumpText;

function preload() {
  // 创建角色纹理
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

  // 创建角色
  player = this.physics.add.sprite(400, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onPlayerLandOnGround);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  jumpText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
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

  // 双跳逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < 2) {
      player.setVelocityY(-160);
      jumpCount++;
      totalJumps++;
      updateStatusText();
      
      // 视觉反馈：第二次跳跃时改变颜色
      if (jumpCount === 2) {
        player.setTint(0xffff00);
      }
    }
  }

  // 检测是否在空中（用于重置跳跃次数）
  // 如果角色向下移动且速度较小，说明即将落地
  if (player.body.velocity.y > 0 && player.body.touching.down) {
    if (jumpCount > 0) {
      jumpCount = 0;
      player.clearTint();
      updateStatusText();
    }
  }

  updateStatusText();
}

function onPlayerLandOnGround() {
  // 当角色与地面碰撞时重置跳跃次数
  if (jumpCount > 0) {
    jumpCount = 0;
    player.clearTint();
  }
}

function updateStatusText() {
  statusText.setText(`Total Jumps: ${totalJumps} | Current Jump Count: ${jumpCount}/2`);
  
  let jumpStatus = '';
  if (jumpCount === 0) {
    jumpStatus = 'Ready to jump (Press SPACE)';
  } else if (jumpCount === 1) {
    jumpStatus = 'One jump used - Can double jump!';
  } else if (jumpCount === 2) {
    jumpStatus = 'Both jumps used - Land to reset';
  }
  
  jumpText.setText(jumpStatus);
}

new Phaser.Game(config);