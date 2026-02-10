class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.enemyCount = 0;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化游戏状态
    this.score = 0;
    this.gameOver = false;
    this.enemyCount = 0;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 分数计时器（每100ms增加1分）
    this.scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
        }
      },
      callbackScope: this,
      loop: true
    });

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 初始化信号
    window.__signals__ = {
      gameOver: false,
      score: 0,
      enemyCount: 0,
      playerX: 400,
      playerY: 550
    };

    console.log(JSON.stringify({
      type: 'game_start',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 300;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.enemyCount = this.enemies.children.size;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置（避免贴边）
    const x = Phaser.Math.Between(50, 750);
    
    // 创建敌人
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(160); // 设置下落速度为160
    enemy.body.setSize(30, 30);

    this.enemyCount++;

    console.log(JSON.stringify({
      type: 'enemy_spawn',
      x: x,
      count: this.enemyCount,
      timestamp: Date.now()
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText.setVisible(true);

    // 停止定时器
    this.enemyTimer.remove();
    this.scoreTimer.remove();

    // 更新最终信号
    window.__signals__.gameOver = true;
    window.__signals__.finalScore = this.score;

    console.log(JSON.stringify({
      type: 'game_over',
      score: this.score,
      enemyCount: this.enemyCount,
      timestamp: Date.now()
    }));
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
  scene: GameScene
};

const game = new Phaser.Game(config);