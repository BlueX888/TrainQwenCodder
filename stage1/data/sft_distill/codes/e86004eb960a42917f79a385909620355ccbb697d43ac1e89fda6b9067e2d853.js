class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.wasd = null;
    this.gameOver = false;
    this.survivalTime = 0;
    this.score = 0;
    this.health = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
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
    
    // 在随机位置生成15个敌人
    for (let i = 0; i < 15; i++) {
      let x, y;
      // 确保敌人不在玩家附近生成
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.2);
    }

    // 设置玩家与敌人的碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.healthText = this.add.text(16, 50, 'Health: 100', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 16, 'Use Arrow Keys or WASD to move. Avoid red enemies!', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5, 0);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间和分数
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.score = this.survivalTime * 10;
    this.scoreText.setText('Time: ' + this.survivalTime + 's (Score: ' + this.score + ')');

    // 玩家移动控制
    const playerSpeed = 200;
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

    // 标准化对角线移动速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 让每个敌人追踪玩家
    const enemySpeed = 120;
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的角度
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 设置敌人朝向玩家的速度
      this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);

      // 旋转敌人朝向玩家（可选的视觉效果）
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.health = 0;
    this.healthText.setText('Health: 0');

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红表示被击中
    player.setTint(0xff0000);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER!\nSurvived: ' + this.survivalTime + 's\nScore: ' + this.score, {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 400, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 点击重启游戏
    this.input.once('pointerdown', () => {
      this.scene.restart();
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
  scene: GameScene
};

new Phaser.Game(config);