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
let statusText;
let gameOverText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 30, 30);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0);
  player.setDamping(true);
  player.setDrag(0.8);
  player.setMaxVelocity(300);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在场景边缘随机生成10个敌人
  const spawnPositions = [
    // 上边缘
    { x: Phaser.Math.Between(100, 700), y: 50 },
    { x: Phaser.Math.Between(100, 700), y: 50 },
    // 下边缘
    { x: Phaser.Math.Between(100, 700), y: 550 },
    { x: Phaser.Math.Between(100, 700), y: 550 },
    // 左边缘
    { x: 50, y: Phaser.Math.Between(100, 500) },
    { x: 50, y: Phaser.Math.Between(100, 500) },
    // 右边缘
    { x: 750, y: Phaser.Math.Between(100, 500) },
    { x: 750, y: Phaser.Math.Between(100, 500) },
    // 四个角
    { x: 100, y: 100 },
    { x: 700, y: 500 }
  ];

  spawnPositions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 状态文本
  statusText = this.add.text(16, 16, 'Survival Time: 0.0s\nEnemies: 10\nSpeed: 300', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });

  // 游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 6
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 添加提示文本
  this.add.text(400, 580, 'Use Arrow Keys or WASD to move and dodge enemies!', {
    fontSize: '16px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta / 1000;

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
  enemies.children.entries.forEach(enemy => {
    this.physics.moveToObject(enemy, player, 360);
  });

  // 更新状态文本
  statusText.setText(
    `Survival Time: ${survivalTime.toFixed(1)}s\n` +
    `Enemies: ${enemies.countActive(true)}\n` +
    `Player Speed: 300 | Enemy Speed: 360`
  );
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  gameOver = true;

  // 停止所有物理运动
  this.physics.pause();

  // 玩家变红
  player.setTint(0xff0000);

  // 显示游戏结束信息
  gameOverText.setText(
    `GAME OVER!\n\n` +
    `Survival Time: ${survivalTime.toFixed(1)}s\n\n` +
    `Press F5 to Restart`
  );
  gameOverText.setVisible(true);

  // 输出验证信号
  console.log('Game Over - Verification Status:', {
    gameOver: true,
    survivalTime: survivalTime.toFixed(1),
    enemiesCount: enemies.countActive(true),
    playerPosition: { x: player.x, y: player.y }
  });
}

const game = new Phaser.Game(config);