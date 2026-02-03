class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.scoreText = null;
    this.enemyTimer = null;
    
    // 初始化信号对象
    window.__signals__ = {
      gameState: 'playing',
      score: 0,
      isAlive: true,
      collisionCount: 0
    };
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

    // 创建敌人纹理（黄色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每 1.5 秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加分数计时器（每秒加 10 分）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameOver) {
          this.score += 10;
          this.scoreText.setText('Score: ' + this.score);
          window.__signals__.score = this.score;
        }
      },
      callbackScope: this,
      loop: true
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      state: 'playing'
    }));
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

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为 80
    enemy.setVelocityY(80);
    enemy.body.setSize(30, 30);

    console.log(JSON.stringify({
      event: 'enemy_spawn',
      timestamp: Date.now(),
      position: { x: x, y: -30 },
      velocity: 80
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    
    // 停止敌人生成
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 380, 'Final Score: ' + this.score, {
      fontSize: '32px',
      fill: '#ffffff'
    });
    finalScoreText.setOrigin(0.5);

    const restartText = this.add.text(400, 450, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#00ff00'
    });
    restartText.setOrigin(0.5);

    // 更新信号
    window.__signals__.gameState = 'game_over';
    window.__signals__.isAlive = false;
    window.__signals__.collisionCount += 1;

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      finalScore: this.score,
      collisionPosition: { x: player.x, y: player.y }
    }));

    // 添加重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.gameOver = false;
      this.score = 0;
      window.__signals__.gameState = 'playing';
      window.__signals__.isAlive = true;
      window.__signals__.score = 0;
      
      console.log(JSON.stringify({
        event: 'game_restart',
        timestamp: Date.now()
      }));
    });
  }
}

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
  scene: DodgeGameScene
};

new Phaser.Game(config);