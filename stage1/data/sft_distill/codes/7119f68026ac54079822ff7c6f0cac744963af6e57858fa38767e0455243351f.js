const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let player;
let enemies;
let cursors;
let gameOver = false;
let score = 0;
let scoreText;
let gameOverText;
let enemyTimer;

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 生成玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 生成敌人纹理（红色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 定时生成敌人（每秒一个）
  enemyTimer = this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  // 游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER\nClick to Restart', {
    fontSize: '48px',
    fill: '#ff0000',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 点击重启
  this.input.on('pointerdown', () => {
    if (gameOver) {
      this.scene.restart();
      gameOver = false;
      score = 0;
    }
  });
}

function update() {
  if (gameOver) {
    return;
  }

  // 玩家移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  // 清理越界的敌人并增加分数
  enemies.children.entries.forEach((enemy) => {
    if (enemy.y > 620) {
      enemy.destroy();
      score += 10;
      scoreText.setText('Score: ' + score);
    }
  });
}

function spawnEnemy() {
  if (gameOver) {
    return;
  }

  // 随机 X 位置生成敌人
  const x = Phaser.Math.Between(50, 750);
  const enemy = enemies.create(x, -30, 'enemy');
  
  // 设置敌人下落速度为 300
  enemy.setVelocityY(300);
}

function hitEnemy(player, enemy) {
  // 游戏结束
  gameOver = true;
  
  // 停止物理系统
  this.physics.pause();
  
  // 改变玩家颜色表示死亡
  player.setTint(0xff0000);
  
  // 显示游戏结束文本
  gameOverText.setVisible(true);
  
  // 停止敌人生成
  if (enemyTimer) {
    enemyTimer.remove();
  }
}

// 启动游戏
new Phaser.Game(config);