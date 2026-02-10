class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证状态：存活时间
    this.gameOver = false;
    this.enemies = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
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
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200);

    // 创建3个敌人，随机位置
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: width - 100, y: 100 },
      { x: width / 2, y: height - 100 }
    ];

    for (let i = 0; i < 3; i++) {
      const enemy = this.physics.add.sprite(
        enemyPositions[i].x,
        enemyPositions[i].y,
        'enemy'
      );
      enemy.setCollideWorldBounds(true);
      this.enemies.push(enemy);

      // 添加碰撞检测
      this.physics.add.overlap(this.player, enemy, this.hitEnemy, null, this);
    }

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏说明
    this.add.text(width / 2, 30, 'Use Arrow Keys to Dodge Enemies!', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(width / 2, height / 2 + 60, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // 空格键重启
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.timeText.setText(`Time: ${(this.survivalTime / 1000).toFixed(1)}s`);

    // 玩家移动控制
    const speed = 200;
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
    this.enemies.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 80);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;

    // 停止所有物理对象
    this.player.setVelocity(0);
    this.enemies.forEach(e => e.setVelocity(0));

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 玩家闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 3
    });

    console.log(`Game Over! Survival Time: ${(this.survivalTime / 1000).toFixed(1)}s`);
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

new Phaser.Game(config);