class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
    this.enemySpeed = 240;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在随机位置生成10个敌人
    for (let i = 0; i < 10; i++) {
      let x, y;
      // 确保敌人不在玩家附近生成
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 16, 'Use Arrow Keys or WASD to move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 重置计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );
      
      this.physics.velocityFromRotation(
        angle,
        this.enemySpeed,
        enemy.body.velocity
      );

      // 让敌人面向玩家
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束信息
    this.gameOverText.setText(
      `GAME OVER!\nSurvived: ${this.survivalTime.toFixed(1)}s\nPress R to Restart`
    ).setVisible(true);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });

    console.log('Game Over - Survival Time:', this.survivalTime.toFixed(2), 'seconds');
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