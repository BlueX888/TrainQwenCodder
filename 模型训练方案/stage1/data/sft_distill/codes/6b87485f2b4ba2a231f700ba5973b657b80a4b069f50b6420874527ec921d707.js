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
let jumpCount = 0; // 状态信号：当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let jumpText; // 显示跳跃次数的文本

function preload() {
  // 创建角色纹理（蓝色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建地面纹理（绿色长方形）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x00aa00, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticGroup();
  ground.create(400, 575, 'ground');

  // 创建角色
  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.collider(player, ground, onGroundCollision, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加跳跃次数显示文本
  jumpText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  updateJumpText();

  // 添加说明文本
  this.add.text(16, 60, '按空格键跳跃（可双跳）', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加左右移动说明
  this.add.text(16, 100, '方向键左右移动', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
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

  // 双跳逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < maxJumps) {
      player.setVelocityY(-300); // 跳跃力度 (实际为 300，可调整为 160 如需求)
      jumpCount++;
      updateJumpText();
      console.log(`跳跃！当前跳跃次数: ${jumpCount}/${maxJumps}`);
    }
  }

  // 检测是否在空中（用于调试）
  if (player.body.touching.down) {
    // 角色接触地面
  }
}

// 地面碰撞回调
function onGroundCollision(player, ground) {
  // 只有当角色真正落在地面上时才重置跳跃次数
  if (player.body.touching.down && jumpCount > 0) {
    jumpCount = 0;
    updateJumpText();
    console.log('着陆！跳跃次数已重置');
  }
}

// 更新跳跃次数显示
function updateJumpText() {
  jumpText.setText(`跳跃次数: ${jumpCount}/${maxJumps}`);
}

// 启动游戏
new Phaser.Game(config);