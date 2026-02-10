class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.survivalTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      gameOver: false,
      survivalTime: 0,
      enemiesSpawned: 0,
      collisions: 0
    };

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
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每1秒）
    this.enemyTimer = this.time.addEvent({
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

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 添加空格键重启功能
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      // 检测空格键重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.restartGame();
      }
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新存活时间
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.score = seconds;
    this.scoreText.setText('Time: ' + seconds + 's');

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.survivalTime = this.survivalTime;

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(200); // 设置下落速度为 200

    // 更新生成计数
    window.__signals__.enemiesSpawned++;

    console.log(JSON.stringify({
      event: 'enemy_spawned',
      position: { x: x, y: -30 },
      count: window.__signals__.enemiesSpawned,
      timestamp: Date.now()
    }));
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    window.__signals__.gameOver = true;
    window.__signals__.collisions++;

    // 停止物理系统
    this.physics.pause();

    // 玩家变红
    player.setTint(0xff0000);

    // 停止敌人生成
    this.enemyTimer.remove();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    console.log(JSON.stringify({
      event: 'game_over',
      finalScore: this.score,
      survivalTime: this.survivalTime,
      enemiesSpawned: window.__signals__.enemiesSpawned,
      timestamp: Date.now()
    }));
  }

  restartGame() {
    // 重置信号
    window.__signals__ = {
      score: 0,
      gameOver: false,
      survivalTime: 0,
      enemiesSpawned: 0,
      collisions: 0
    };

    console.log(JSON.stringify({
      event: 'game_restart',
      timestamp: Date.now()
    }));

    // 重启场景
    this.scene.restart();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);