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

// 游戏状态变量
let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
let totalJumps = 0; // 总跳跃次数统计
let jumpText;
let statsText;
const MAX_JUMPS = 2; // 最大跳跃次数
const JUMP_VELOCITY = -200; // 跳跃力度

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

  ground = this.physics.add.staticGroup();
  ground.create(400, 575, 'ground');

  // 创建玩家角色
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(0, 0, 40, 50);
  playerGraphics.generateTexture('player', 40, 50);
  playerGraphics.destroy();

  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onLanding, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建显示文本
  jumpText = this.add.text(16, 16, 'Jumps Available: 2/2', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  statsText = this.add.text(16, 50, 'Total Jumps: 0', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(400, 100, 'Press SPACE or UP to Jump', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);

  this.add.text(400, 140, 'You can jump twice before landing!', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);

  // 添加左右移动说明
  this.add.text(400, 180, 'Use LEFT/RIGHT arrows to move', {
    fontSize: '18px',
    fill: '#666',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
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
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(JUMP_VELOCITY);
      jumpCount++;
      totalJumps++;
      updateUI();
    }
  }

  // 更新UI显示
  const remaining = MAX_JUMPS - jumpCount;
  jumpText.setText(`Jumps Available: ${remaining}/${MAX_JUMPS}`);
  statsText.setText(`Total Jumps: ${totalJumps}`);

  // 根据跳跃次数改变颜色提示
  if (jumpCount === 0) {
    jumpText.setStyle({ fill: '#00ff00' });
  } else if (jumpCount === 1) {
    jumpText.setStyle({ fill: '#ff9900' });
  } else {
    jumpText.setStyle({ fill: '#ff0000' });
  }
}

// 着陆回调函数
function onLanding() {
  // 当玩家接触地面且向下速度大于0时，重置跳跃计数
  if (player.body.touching.down && player.body.velocity.y >= 0) {
    jumpCount = 0;
    updateUI();
  }
}

function updateUI() {
  const remaining = MAX_JUMPS - jumpCount;
  jumpText.setText(`Jumps Available: ${remaining}/${MAX_JUMPS}`);
  statsText.setText(`Total Jumps: ${totalJumps}`);
}

// 启动游戏
new Phaser.Game(config);