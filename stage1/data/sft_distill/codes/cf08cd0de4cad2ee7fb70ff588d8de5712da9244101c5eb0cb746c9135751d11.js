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
let gameOver = false;
let survivalTime = 0;
let scoreText;
let gameOverText;
let startTime;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
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
  // 初始化游戏状态
  gameOver = false;
  survivalTime = 0;
  startTime = this.time.now;

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(200, 200);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在场景边缘随机生成3个敌人
  const spawnPositions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 400, y: 500 }
  ];

  spawnPositions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
    fontSize: '48px',
    fill: '#ff0000',
    fontFamily: 'Arial',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 添加重启键
  this.input.keyboard.on('keydown-R', () => {
    if (gameOver) {
      this.scene.restart();
    }
  });
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime = Math.floor((time - startTime) / 1000);
  scoreText.setText('Survival Time: ' + survivalTime + 's');

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  // 敌人追踪玩家
  enemies.children.entries.forEach(enemy => {
    this.physics.moveToObject(enemy, player, 160);
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  // 游戏结束
  gameOver = true;

  // 停止所有移动
  player.setVelocity(0);
  enemies.children.entries.forEach(enemy => {
    enemy.setVelocity(0);
  });

  // 显示游戏结束文本
  gameOverText.setVisible(true);

  // 玩家变灰表示死亡
  player.setTint(0x888888);

  console.log('Game Over! Survival Time:', survivalTime, 'seconds');
}

new Phaser.Game(config);