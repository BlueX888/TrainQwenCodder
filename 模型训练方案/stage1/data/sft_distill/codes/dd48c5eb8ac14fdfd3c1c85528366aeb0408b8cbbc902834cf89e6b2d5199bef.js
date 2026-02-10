const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
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
let enemies;
let cursors;
let wasd;
let gameOver = false;
let survivalTime = 0;
let timeText;
let statusText;
let lastTime = 0;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(250, 250);
  player.setDrag(800, 800);

  // 创建敌人组
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: 7, // 创建 8 个敌人（0-7）
    setXY: { 
      x: 100, 
      y: 100, 
      stepX: 200, // 水平间隔
      stepY: 150  // 垂直间隔（每 4 个换行）
    }
  });

  // 设置敌人位置（围绕场景边缘分布）
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 400, y: 50 },
    { x: 400, y: 550 },
    { x: 50, y: 300 },
    { x: 750, y: 300 }
  ];

  enemies.children.entries.forEach((enemy, index) => {
    enemy.setPosition(positions[index].x, positions[index].y);
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1); // 碰到边界反弹
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 显示存活时间
  timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 显示状态信息
  statusText = this.add.text(16, 50, 'Use WASD or Arrow Keys to move\nAvoid the red enemies!', {
    fontSize: '16px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 游戏说明
  this.add.text(400, 580, 'Enemy Speed: 200 | Player Max Speed: 250', {
    fontSize: '14px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 1);

  lastTime = this.time.now;
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta / 1000;
  timeText.setText(`Survival Time: ${survivalTime.toFixed(1)}s`);

  // 玩家移动控制
  const acceleration = 600;

  if (cursors.left.isDown || wasd.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown || wasd.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 敌人追踪玩家
  enemies.children.entries.forEach((enemy) => {
    // 计算敌人到玩家的方向并设置速度
    this.physics.moveToObject(enemy, player, 200);
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  gameOver = true;

  // 停止所有物理效果
  this.physics.pause();

  // 玩家变红表示被击中
  player.setTint(0xff0000);

  // 显示游戏结束信息
  statusText.setText('GAME OVER!\nYou survived ' + survivalTime.toFixed(1) + ' seconds');
  statusText.setFontSize('28px');
  statusText.setColor('#ff0000');
  statusText.setPosition(400, 300);
  statusText.setOrigin(0.5, 0.5);

  // 添加重启提示
  const restartText = this.add.text(400, 350, 'Refresh to restart', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 0.5);

  // 输出最终状态到控制台（可验证信号）
  console.log('=== GAME OVER ===');
  console.log('Survival Time:', survivalTime.toFixed(2), 'seconds');
  console.log('Final Player Position:', { x: player.x, y: player.y });
  console.log('Enemies Count:', enemies.children.entries.length);
}

const game = new Phaser.Game(config);