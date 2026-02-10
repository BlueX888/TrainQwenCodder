class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建心形纹理（用于显示血量）
    const heartGraphics = this.add.graphics();
    heartGraphics.fillStyle(0xff0000, 1);
    heartGraphics.fillCircle(8, 8, 6);
    heartGraphics.fillCircle(16, 8, 6);
    heartGraphics.fillTriangle(4, 10, 20, 10, 12, 22);
    heartGraphics.generateTexture('heart', 24, 24);
    heartGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，随机位置和速度
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量显示
    this.createHealthDisplay();

    // 添加提示文本
    this.add.text(400, 30, '使用方向键移动，避开红色敌人', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 添加空格键重启功能
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.health <= 0) {
        this.scene.restart();
      }
    });
  }

  createHealthDisplay() {
    // 血量文本
    this.healthText = this.add.text(20, 60, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 心形图标数组
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(20 + i * 30, 100, 'heart');
      heart.setOrigin(0, 0.5);
      this.hearts.push(heart);
    }
  }

  updateHealthDisplay() {
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 更新心形显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.hearts[i].setAlpha(1);
      } else {
        this.hearts[i].setAlpha(0.3);
      }
    }
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.updateHealthDisplay();

    // 检查是否游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 启动无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 5次闪烁（0.5秒）
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
      }
    });

    // 0.5秒后结束无敌状态（双重保险）
    this.time.delayedCall(500, () => {
      this.isInvincible = false;
      this.player.alpha = 1;
    });
  }

  gameOver() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 游戏结束闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    // 如果游戏结束，不处理移动
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
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