// 游戏配置
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

// 全局变量
let player;
let enemies;
let cursors;
let survivalTime = 0;
let isGameOver = false;
let scoreText;
let gameOverText;

// 初始化 signals
window.__signals__ = {
  survivalTime: 0,
  enemyCount: 5,
  playerAlive: true,
  gameOver: false,
  playerPosition: { x: 0, y: 0 },
  enemyPositions: []
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff3333, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(200, 200);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在四周生成 5 个敌人
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 400, y: 50 }
  ];

  positions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建 WASD 控制
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 显示存活时间
  scoreText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER!\nPress R to Restart', {
    fontSize: '48px',
    fill: '#ff0000',
    fontFamily: 'Arial',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 添加重启键
  this.input.keyboard.on('keydown-R', () => {
    if (isGameOver) {
      this.scene.restart();
      resetGame();
    }
  });

  console.log('Game started with 5 enemies chasing player');
}

function update(time, delta) {
  if (isGameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta / 1000;
  scoreText.setText(`Survival Time: ${Math.floor(survivalTime)}s`);

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(200);
  }

  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(200);
  }

  // 敌人追踪玩家逻辑
  const enemyPositions = [];
  enemies.children.entries.forEach(enemy => {
    // 计算敌人到玩家的方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 设置敌人朝向玩家移动，速度 120
    this.physics.velocityFromRotation(angle, 120, enemy.body.velocity);

    // 记录敌人位置
    enemyPositions.push({ x: Math.floor(enemy.x), y: Math.floor(enemy.y) });
  });

  // 更新 signals
  window.__signals__.survivalTime = Math.floor(survivalTime);
  window.__signals__.playerPosition = {
    x: Math.floor(player.x),
    y: Math.floor(player.y)
  };
  window.__signals__.enemyPositions = enemyPositions;
  window.__signals__.playerAlive = !isGameOver;
}

function hitEnemy(player, enemy) {
  if (isGameOver) return;

  // 游戏结束
  isGameOver = true;
  window.__signals__.gameOver = true;
  window.__signals__.playerAlive = false;

  // 停止所有物理对象
  player.setVelocity(0);
  enemies.children.entries.forEach(e => e.setVelocity(0));

  // 显示游戏结束文本
  gameOverText.setVisible(true);

  // 输出日志
  console.log(JSON.stringify({
    event: 'gameOver',
    survivalTime: Math.floor(survivalTime),
    finalPosition: { x: Math.floor(player.x), y: Math.floor(player.y) }
  }));
}

function resetGame() {
  survivalTime = 0;
  isGameOver = false;
  window.__signals__ = {
    survivalTime: 0,
    enemyCount: 5,
    playerAlive: true,
    gameOver: false,
    playerPosition: { x: 0, y: 0 },
    enemyPositions: []
  };
}

// 启动游戏
new Phaser.Game(config);