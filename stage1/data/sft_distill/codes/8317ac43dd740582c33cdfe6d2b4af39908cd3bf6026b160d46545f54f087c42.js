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
  }
};

let player;
let enemies;
let cursors;
let gameOver = false;
let score = 0;
let scoreText;
let gameOverText;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  // 初始化游戏状态
  gameOver = false;
  score = 0;

  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 创建游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER', {
    fontSize: '64px',
    fill: '#ff0000'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 定时生成敌人（每1秒生成一个）
  this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);
}

function update() {
  if (gameOver) {
    return;
  }

  // 玩家左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  // 清理超出屏幕的敌人并增加分数
  enemies.children.entries.forEach(enemy => {
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

  // 在顶部随机位置生成敌人
  const x = Phaser.Math.Between(50, 750);
  const enemy = enemies.create(x, -30, 'enemy');
  
  // 设置敌人向下移动速度为160
  enemy.setVelocityY(160);
  enemy.body.setSize(30, 30);
}

function hitEnemy(player, enemy) {
  // 游戏结束
  gameOver = true;
  
  // 停止物理系统
  this.physics.pause();
  
  // 玩家变红
  player.setTint(0xff0000);
  
  // 显示游戏结束文本
  gameOverText.setVisible(true);
  
  // 添加重启提示
  const restartText = this.add.text(400, 370, 'Click to Restart', {
    fontSize: '32px',
    fill: '#ffffff'
  });
  restartText.setOrigin(0.5);
  
  // 点击重启游戏
  this.input.once('pointerdown', () => {
    this.scene.restart();
  });
}

const game = new Phaser.Game(config);