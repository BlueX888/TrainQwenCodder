// 游戏状态信号
window.__signals__ = {
  gameOver: false,
  score: 0,
  playerX: 0,
  playerY: 0,
  enemyCount: 0,
  collisionDetected: false
};

class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.gameOver = false;
    this.enemyTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 定时生成敌人（每1秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 初始化信号
    this.updateSignals();
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人并增加分数
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 600) {
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
    });

    // 更新信号
    this.updateSignals();
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机 X 位置（避免贴边）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(200); // 设置下落速度为 200

    // 更新信号
    this.updateSignals();
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText.setVisible(true);
    
    // 停止生成敌人
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }

    // 更新信号
    window.__signals__.gameOver = true;
    window.__signals__.collisionDetected = true;
    this.updateSignals();

    // 输出日志
    console.log(JSON.stringify({
      event: 'gameOver',
      score: this.score,
      playerPosition: { x: this.player.x, y: this.player.y },
      enemyCount: this.enemies.children.entries.length
    }));
  }

  updateSignals() {
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.score = this.score;
    window.__signals__.playerX = this.player ? this.player.x : 0;
    window.__signals__.playerY = this.player ? this.player.y : 0;
    window.__signals__.enemyCount = this.enemies ? this.enemies.children.entries.length : 0;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGameScene
};

// 启动游戏
const game = new Phaser.Game(config);