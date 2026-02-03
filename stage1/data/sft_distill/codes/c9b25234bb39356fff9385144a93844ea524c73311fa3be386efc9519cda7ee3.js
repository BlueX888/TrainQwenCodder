class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证状态信号
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 添加 3 个敌人，随机位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 显示存活时间
    this.timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Survival Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const speed = 250;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.getChildren().forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 200);
    });
  }

  handleCollision(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有物体
    player.setVelocity(0);
    this.enemies.getChildren().forEach(e => e.setVelocity(0));

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);

    const finalTimeText = this.add.text(400, 370, 
      `You survived for ${this.survivalTime.toFixed(1)} seconds`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    finalTimeText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(400, 420, 
      'Press SPACE to Restart', {
      fontSize: '20px',
      fill: '#00ff00'
    });
    restartText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });

    console.log('Game Over! Survival Time:', this.survivalTime.toFixed(2), 'seconds');
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);