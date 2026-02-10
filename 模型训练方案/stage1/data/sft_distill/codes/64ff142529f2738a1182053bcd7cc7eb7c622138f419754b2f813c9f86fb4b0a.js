class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.survivalTime = 0;
    this.enemySpawnTimer = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化游戏状态信号
    window.__signals__ = {
      gameOver: false,
      score: 0,
      survivalTime: 0,
      enemiesSpawned: 0,
      playerX: 0,
      playerY: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
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

    // 定时生成敌人（每1秒生成一个）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 更新初始信号
    this.updateSignals();

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.score = Math.floor(this.survivalTime / 1000);
    this.scoreText.setText('Time: ' + this.score + 's');

    // 玩家移动控制
    const playerSpeed = 300;

    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });

    // 更新信号
    this.updateSignals();
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在随机X位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度为360（向下）
    enemy.setVelocityY(360);
    enemy.body.setSize(30, 30);

    // 更新生成计数
    window.__signals__.enemiesSpawned++;

    console.log(JSON.stringify({
      event: 'enemy_spawn',
      x: x,
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

    // 停止生成敌人
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }

    // 更新最终信号
    window.__signals__.gameOver = true;
    this.updateSignals();

    console.log(JSON.stringify({
      event: 'game_over',
      finalScore: this.score,
      survivalTime: this.survivalTime,
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.score = this.score;
    window.__signals__.survivalTime = Math.floor(this.survivalTime);
    window.__signals__.playerX = Math.floor(this.player.x);
    window.__signals__.playerY = Math.floor(this.player.y);
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

// 创建游戏实例
const game = new Phaser.Game(config);