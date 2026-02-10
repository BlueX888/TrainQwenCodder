class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.score = 0;
    this.gameOver = false;
    this.survivedTime = 0;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化游戏状态信号
    window.__signals__ = {
      score: 0,
      gameOver: false,
      survivedTime: 0,
      enemiesSpawned: 0,
      enemiesDodged: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每0.8秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建存活时间文本
    this.timeText = this.add.text(16, 48, 'Time: 0.0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.finalScoreText = this.add.text(400, 370, '', {
      fontSize: '32px',
      fill: '#ffffff'
    });
    this.finalScoreText.setOrigin(0.5);
    this.finalScoreText.setVisible(false);

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now()
    }));
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(360); // 设置下落速度为360
    enemy.body.setSize(30, 30);

    window.__signals__.enemiesSpawned++;

    console.log(JSON.stringify({
      event: 'enemy_spawned',
      position: { x, y: -30 },
      count: window.__signals__.enemiesSpawned
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 停止游戏
    this.physics.pause();
    this.enemyTimer.remove();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.finalScoreText.setText(
      `Final Score: ${this.score}\nSurvived: ${this.survivedTime.toFixed(1)}s`
    );
    this.finalScoreText.setVisible(true);

    console.log(JSON.stringify({
      event: 'game_over',
      score: this.score,
      survivedTime: this.survivedTime,
      enemiesDodged: window.__signals__.enemiesDodged,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新存活时间
    this.survivedTime += delta / 1000;
    window.__signals__.survivedTime = this.survivedTime;
    this.timeText.setText(`Time: ${this.survivedTime.toFixed(1)}s`);

    // 玩家移动控制
    const speed = 300;
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人并增加分数
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        this.score += 10;
        window.__signals__.score = this.score;
        window.__signals__.enemiesDodged++;
        this.scoreText.setText(`Score: ${this.score}`);
        enemy.destroy();

        console.log(JSON.stringify({
          event: 'enemy_dodged',
          score: this.score,
          dodged: window.__signals__.enemiesDodged
        }));
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGameScene
};

new Phaser.Game(config);