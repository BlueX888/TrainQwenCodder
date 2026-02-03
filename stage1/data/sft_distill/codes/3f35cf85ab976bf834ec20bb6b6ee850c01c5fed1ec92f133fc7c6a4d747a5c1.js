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
  // 使用Graphics生成纹理，不依赖外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（白色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffffff, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
    fontSize: '48px',
    fill: '#ff0000',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 定时生成敌人（每0.8秒生成一个）
  enemyTimer = this.time.addEvent({
    delay: 800,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  // 碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 重启键
  this.input.keyboard.on('keydown-R', () => {
    if (gameOver) {
      this.scene.restart();
      gameOver = false;
      score = 0;
    }
  });
}

function update(time, delta) {
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

  // 清理超出屏幕的敌人并增加分数
  enemies.children.entries.forEach((enemy) => {
    if (enemy.y > 600) {
      enemy.destroy();
      if (!gameOver) {
        score += 10;
        scoreText.setText('Score: ' + score);
      }
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
  
  // 设置敌人下落速度为200
  enemy.setVelocityY(200);
  enemy.body.setSize(30, 30);
}

function hitEnemy(player, enemy) {
  // 游戏结束
  gameOver = true;
  
  // 停止敌人生成
  enemyTimer.destroy();
  
  // 停止所有敌人移动
  enemies.children.entries.forEach((e) => {
    e.setVelocity(0, 0);
  });
  
  // 停止玩家移动
  player.setVelocity(0, 0);
  
  // 玩家变红
  player.setTint(0xff0000);
  
  // 显示游戏结束文本
  gameOverText.setVisible(true);
}

const game = new Phaser.Game(config);